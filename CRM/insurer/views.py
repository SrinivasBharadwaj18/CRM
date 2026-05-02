import pandas as pd
from itertools import cycle
from datetime import time
from datetime import timedelta # Ensure this is imported at the top
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Q, Sum, F
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Internal Imports
from .utils.permissions import IsOwner
from .utils.mappings import build_column_map
from .serializers import EmployeesSerializer, LeadSerializer
from .models import (
    Employee, Lead, MotorLead, HealthLead, LifeLead, 
    Conversion, Insurance, FollowUp, Score, 
    DailyOverallPerformance, Attendance, LeaveRequest,
    RecruitmentStats,AdminTask, Incentive
)
from django.db.models import Min, Case, When, Value, IntegerField

from rest_framework.views import APIView
from django.db.models.functions import TruncWeek
from .serializers import IncentiveSerializer
import calendar
from datetime import date
from django.db.models.functions import TruncWeek, TruncMonth




# --- AUTHENTICATION ---

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["name"] = user.name
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'username': self.user.username,
            'role': self.user.role,
            'name': self.user.name,
            'email': self.user.email,
        }
        return data

class Login(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# --- EMPLOYEE MANAGEMENT ---

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsOwner])
def create_employee(request):
    serializer = EmployeesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsOwner])
def view_employees(request):
    employees = Employee.objects.filter(role="agent").annotate(
        total_leads=Count('leads'),
        total_conversions=Count('leads', filter=Q(leads__status='converted'))
    )
    serializer = EmployeesSerializer(employees, many=True)
    return Response(serializer.data)


# --- LEAD MANAGEMENT ---

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOwner])
def upload_leads(request):
    file = request.FILES.get("file")
    if not file: return Response({"error": "No file"}, status=400)

    try:
        df = pd.read_csv(file)
    except:
        return Response({"error": "Invalid CSV"}, status=400)

    col_map = build_column_map(df.columns)
    agents = Employee.objects.filter(role="agent", is_active=True)
    if not agents.exists(): return Response({"error": "No active agents"}, status=400)
    agent_cycle = cycle(agents)

    leads_created = 0
    with transaction.atomic():
        for _, row in df.iterrows():
            assigned_agent = next(agent_cycle)
            lead = Lead.objects.create(
                name=row.get(col_map.get("name"), "Unknown"),
                phone=str(row.get(col_map.get("phone"))),
                insurance_type='motor',
                assigned_to=assigned_agent,
                assigned_at=timezone.now(),
                status='new',
                priority='hot'
            )
            MotorLead.objects.create(lead=lead, vehicle_number=row.get(col_map.get("vehicle_number"), ""))
            leads_created += 1

    return Response({"message": f"Uploaded {leads_created} leads"})



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agent_leads(request):
    if request.user.role != "agent":
        return Response({"error": "Unauthorized"}, status=403)

    # 1. Filter by agent AND exclude leads that are already closed/converted
    queryset = Lead.objects.filter(
        assigned_to=request.user
    )

    # 2. Update priorities for ACTIVE leads only
    for lead in queryset:
        lead.update_priority()

    # 3. ANNOTATE: Get the earliest pending follow-up date
    queryset = queryset.annotate(
        next_call=Min(
            'followups__follow_up_date', 
            filter=Q(followups__follow_up_status='pending')
        )
    )

    # 4. CUSTOM SORT: Keep Hot at the top, followed by Warm, then Cold
    sorted_leads = queryset.order_by(
        Case(
            When(priority='hot', then=Value(1)),
            When(priority='warm', then=Value(2)),
            When(priority='cold', then=Value(3)),
            output_field=IntegerField(),
        ),
        'next_call',   
        '-created_at'  
    ).distinct()

    serializer = LeadSerializer(sorted_leads, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_detail(request, id):
    lead = get_object_or_404(Lead, id=id)
    if request.user.role == "agent" and lead.assigned_to != request.user:
        return Response({"error": "Unauthorized"}, status=403)
    serializer = LeadSerializer(lead)
    return Response(serializer.data)


# --- PROCESSING & WORKFLOW ---

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_lead(request, id):
    lead = get_object_or_404(Lead, id=id)
    if request.user.role != "agent" or lead.assigned_to != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        with transaction.atomic():
            # 1. Create the Insurance product
            insurance = Insurance.objects.create(
                insurance_name=request.data.get("insurance_name"),
                insurance_provider=request.data.get("insurance_provider"),
                coverage_amount=float(request.data.get("coverage_amount", 0)),
                premium=float(request.data.get("premium", 0)),
                tenure=int(request.data.get("tenure", 1)),
            )

            # 2. Create the Conversion record
            Conversion.objects.create(
                lead=lead,
                insurance=insurance,
                agent=request.user,
                policy_start_date=request.data.get("policy_start_date"),
                policy_end_date=request.data.get("policy_end_date"),
                premium_amount=insurance.premium,
                payment_status=request.data.get("payment_status", "pending"),
            )

            # 3. Update Lead Status (This removes it from "New Leads" count)
            lead.status = "converted"
            lead.save()

            # 4. Update Agent's Lifetime Score
            request.user.score = F('score') + 1
            request.user.save()

            # 5. Fix: Use Local Time for Dashboard Stats
            local_now = timezone.localtime(timezone.now())
            today = local_now.date()

            # 6. NEW: Update Individual Agent's Daily Score Record
            # This makes the "Sales" count and "Progress Bar" update on the dashboard
            agent_score, _ = Score.objects.get_or_create(
                agent=request.user, 
                date=today,
                defaults={'daily_target': 10, 'achieved_score': 0}
            )
            agent_score.leads_converted = F('leads_converted') + 1
            agent_score.achieved_score = F('achieved_score') + 1
            agent_score.save()

            # 7. Update Global Performance Metrics
            perf, _ = DailyOverallPerformance.objects.get_or_create(date=today)
            perf.total_conversions = F('total_conversions') + 1
            perf.connected_calls = F('connected_calls') + 1
            perf.save()

        return Response({"message": "Success! Lead converted."}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

from django.utils import timezone
import pytz

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def await_lead(request, id):
    lead = get_object_or_404(Lead, id=id)
    
    # Get the strings from request
    call_date_str = request.data.get("call_date")
    follow_up_str = request.data.get("follow_up_date")

    # Convert naive strings to "Aware" datetimes (IST)
    # This assumes the user's browser is in the Asia/Kolkata zone
    user_tz = pytz.timezone('Asia/Kolkata') 
    
    def make_aware_time(dt_str):
        if not dt_str: return None
        naive_dt = timezone.datetime.fromisoformat(dt_str)
        return user_tz.localize(naive_dt)

    with transaction.atomic():
        FollowUp.objects.filter(lead=lead, follow_up_status='pending').update(follow_up_status='completed')

        FollowUp.objects.create(
            lead=lead,
            assigned_agent=request.user,
            call_date=make_aware_time(call_date_str) or timezone.now(),
            follow_up_date=make_aware_time(follow_up_str),
            notes=request.data.get("notes"),
            next_action=request.data.get("next_action"),
            follow_up_status='pending'
        )
        
        lead.status = "follow_up"
        lead.save()

    return Response({"message": "Follow-up synced with local time."})


# --- DASHBOARDS ---

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def agent_dashboard_stats(request):
    user = request.user
    local_now = timezone.localtime(timezone.now())
    today = local_now.date()

    # 1. Attendance check
    is_checked_in = Attendance.objects.filter(agent=user, date=today).exists()

    # 2. Basic Counts
    new_leads_count = Lead.objects.filter(assigned_to=user, status='new').count()
    
    # --- FIXED COUNTING LOGIC ---
    
    # Header: Counts how many follow-up ACTIONS were finished today
    completed_today = FollowUp.objects.filter(
        assigned_agent=user,
        call_date__date=today,
        follow_up_status='completed'
    ).count()

    # Cards: Counts how many unique LEADS are currently in the "Follow-Up" state
    # This will now match your Leads Page (3 instead of 5)
    pending_leads_count = Lead.objects.filter(
        assigned_to=user,
        status='follow_up',
        followups__follow_up_status='pending'
    ).distinct().count()
    
    # --- END OF FIXED LOGIC ---

    # 3. AT RISK LOGIC (40-48 hour window for New Leads)
    danger_cutoff = local_now - timedelta(hours=40)
    at_risk_qs = Lead.objects.filter(
        assigned_to=user,
        status='new',
        priority='hot',
        created_at__lte=danger_cutoff 
    ).order_by('created_at')[:5]

    at_risk_leads = []
    for lead in at_risk_qs:
        diff = local_now - lead.created_at
        hours_remaining = 48 - (diff.total_seconds() / 3600)
        at_risk_leads.append({
            "id": lead.id,
            "name": lead.name,
            "phone": lead.phone,
            "hours_left": round(max(0, hours_remaining), 1)
        })

    # 4. REVENUE STATS (Added to support your new Converted/Paid tabs)
    conversions_qs = Conversion.objects.filter(agent=user)
    total_premium = conversions_qs.aggregate(Sum('premium_amount'))['premium_amount__sum'] or 0
    # Ensure it looks like this:
    pending_premium = Lead.objects.filter(
        assigned_to=user, 
        status='converted', 
        payment_status='pending'
    ).aggregate(Sum('conversion__premium_amount'))['conversion__premium_amount__sum'] or 0

    # 5. Header stats (Calls/Sales)
    try:
        daily_record = Score.objects.get(agent=user, date=today)
        calls_made = daily_record.calls_made
        conversions = daily_record.leads_converted
        target = daily_record.daily_target
    except Score.DoesNotExist:
        calls_made, conversions, target = 0, 0, 10

    progress = (conversions / target * 100) if target > 0 else 0

    # 6. FINAL RESPONSE
    return Response({
        "agent_name": user.name.split()[0] if user.name else "Agent",
        "is_checked_in": is_checked_in,
        "header_stats": {
            "calls": calls_made, 
            "sales": conversions, 
            "followups_completed": completed_today 
        },
        "cards": {
            "new_leads": new_leads_count,
            "pending_followups": pending_leads_count, # Matches Lead Page exactly
            "personal_score": user.score,
            "target_progress": round(progress, 1)
        },
        "revenue": {
            "total_premium": total_premium,
            "pending_amount": pending_premium
        },
        "at_risk_leads": at_risk_leads,
        "recent_leads": [{"name": l.name, "phone": l.phone, "status": l.status} for l in Lead.objects.filter(assigned_to=user).order_by('-created_at')[:3]],
        "recent_conversions": [
            {"name": c.lead.name, "amount": c.premium_amount} 
            for c in conversions_qs.order_by('-id')[:3]
        ]
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsOwner])
def admin_mega_dashboard(request):
    local_now = timezone.localtime(timezone.now())
    today = local_now.date()
    seven_days_from_now = today + timedelta(days=7)
    
    active_agents_count = Employee.objects.filter(role='agent', is_active=True).count()
    
    # 1. ATTENDANCE (Keeping as requested)
    trend = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_stats = Attendance.objects.filter(date=day)
        p, l = day_stats.filter(status='present').count(), day_stats.filter(status='late').count()
        trend.append({
            "day": day.strftime("%a"), "present": p, "late": l,
            "absent": max(0, active_agents_count - (p + l))
        })

    # 2. REVENUE PIPELINE (Paid vs Pending)
    # Using the 'conversion' reverse relation (singular) as discovered in previous errors
    revenue_stats = Lead.objects.filter(status='converted').aggregate(
        paid=Sum('conversion__premium_amount', filter=Q(payment_status='paid')),
        pending=Sum('conversion__premium_amount', filter=Q(payment_status='pending'))
    )

    # 3. CONVERSION FUNNEL
    total_leads = Lead.objects.count()
    funnel = {
        "new": Lead.objects.filter(status='new').count(),
        "follow_up": Lead.objects.filter(status='follow_up').count(),
        "converted": Lead.objects.filter(status='converted').count(),
        "lost": Lead.objects.filter(status='not_interested').count(),
        "rate": f"{round((Lead.objects.filter(status='converted').count() / total_leads * 100), 1) if total_leads > 0 else 0}%"
    }

    # 4. URGENT EXPIRIES (Motor leads expiring in next 7 days)
    expiries = MotorLead.objects.filter(
        policy_expiry__range=[today, seven_days_from_now],
        lead__status__in=['new', 'follow_up']
    ).select_related('lead', 'lead__assigned_to').order_by('policy_expiry')[:5]

    # 5. AGENT LEADERBOARD
    leaderboard = Employee.objects.filter(role='agent').annotate(
        sales_count=Count('leads', filter=Q(leads__status='converted')),
        total_revenue=Sum('leads__conversion__premium_amount')
    ).order_by('-sales_count')[:5]

    return Response({
        "tiles": {
            "total_employees": Employee.objects.count(),
            "active_agents": active_agents_count,
            "total_leads": total_leads,
            "conversion_rate": funnel['rate']
        },
        "revenue": {
            "paid": revenue_stats['paid'] or 0,
            "pending": revenue_stats['pending'] or 0,
            "total": (revenue_stats['paid'] or 0) + (revenue_stats['pending'] or 0)
        },
        "funnel": funnel,
        "expiries": [
            {
                "customer": e.lead.name,
                "expiry": e.policy_expiry.strftime("%d %b"),
                "agent": e.lead.assigned_to.name if e.lead.assigned_to else "Unassigned",
                "phone": e.lead.phone
            } for e in expiries
        ],
        "leaderboard": [
            {
                "name": a.name,
                "sales": a.sales_count,
                "revenue": a.total_revenue or 0
            } for a in leaderboard
        ],
        "attendance": trend[-1],
        "trend": trend,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_in(request):
    user = request.user
    
    # 1. Use LOCAL time, not UTC
    local_now = timezone.localtime(timezone.now()) 
    today = local_now.date()
    now_time = local_now.time()
    
    if Attendance.objects.filter(agent=user, date=today).exists():
        return Response({"message": "Already checked in!"}, status=400)

    # 2. Compare against shift start
    SHIFT_START = time(9, 30, 0)
    
    # Logic: If 10:00 AM > 9:30 AM -> Late
    status = 'late' if now_time > SHIFT_START else 'present'

    Attendance.objects.create(
        agent=user,
        date=today,
        check_in=now_time,
        status=status
    )

    return Response({
        "message": f"Checked in as {status.capitalize()}",
        "status": status,
        "debug_time": now_time.strftime("%H:%M:%S") # Add this to verify in the console
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def log_call(request, id):
    today = timezone.now().date()
    perf, _ = DailyOverallPerformance.objects.get_or_create(date=today)
    perf.connected_calls = F('connected_calls') + 1
    perf.save()
    return Response({"message": "Call logged"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_current_score(request):
    if request.user.role not in ['owner', 'lead']:
        return Response({"error": "Unauthorized"}, status=403)
    today = timezone.now().date()
    perf, _ = DailyOverallPerformance.objects.get_or_create(date=today)
    return Response({
        "total_calls": perf.total_calls,
        "total_conversions": perf.total_conversions,
        "total_target": perf.total_target,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def close_lead(request, id):
    lead = get_object_or_404(Lead, id=id)
    reason = request.data.get("reason")

    if not reason:
        return Response({"error": "Reason is required"}, status=400)

    with transaction.atomic():
        lead.status = "not_interested"
        lead.priority = "cold"
        lead.save()

        FollowUp.objects.create(
            lead=lead,
            assigned_agent=request.user,
            call_date=timezone.now(),
            # 🛡️ FIX: Provide the current time so the DB doesn't complain
            follow_up_date=timezone.now(), 
            notes=f"CLOSED AS NOT INTERESTED: {reason}",
            follow_up_status='completed'
        )

    return Response({"message": "Lead closed successfully"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_as_paid(request, id):
    lead = get_object_or_404(Lead, id=id)
    
    if lead.status != 'converted':
        return Response({"error": "Only converted leads can be marked as paid"}, status=400)
    
    lead.payment_status = 'paid'
    lead.save(update_fields=['payment_status']) # Explicit save
    
    return Response({
        "message": "Payment confirmed!",
        "payment_status": lead.payment_status
    })


@api_view(['PATCH']) # PATCH is used for partial updates
@permission_classes([IsAuthenticated])
def update_agent_salary(request, agent_id):
    # 1. Security check: Only owners and leads can modify financial data
    # Note: If 'role' is on a profile model, use request.user.employee.role
    user_role = getattr(request.user, 'role', None)
    if user_role not in ['owner', 'lead']:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        # 2. Find the agent using emp_id (swapped from id)
        # We also filter by role='agent' to ensure we aren't accidentally updating an admin
        agent = Employee.objects.get(emp_id=agent_id, role='agent')
        
        new_salary = request.data.get('base_salary')

        # 3. Validation and Update
        if new_salary is not None:
            try:
                # Ensure the value is saved as a number
                agent.base_salary = float(new_salary)
                agent.save()
                return Response({
                    "message": f"Salary updated to ₹{new_salary} for {agent.username}",
                    "emp_id": agent.emp_id,
                    "new_salary": agent.base_salary
                }, status=200)
            except ValueError:
                return Response({"error": "Invalid salary format. Must be a number."}, status=400)
        
        return Response({"error": "Salary value is required"}, status=400)

    except Employee.DoesNotExist:
        return Response({"error": "Agent not found"}, status=404)
    except Exception as e:
        # Catch-all for unexpected errors (like database locks)
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_award_incentive(request):
    # 1. Security Check
    # Using getattr for safety in case 'role' isn't on the User model directly
    user_role = getattr(request.user, 'role', None)
    if user_role not in ['owner', 'lead']:
        return Response({"error": "Only admins can award incentives"}, status=status.HTTP_403_FORBIDDEN)

    # 2. Data Extraction
    agent_id = request.data.get('agent_id')
    amount = request.data.get('amount')
    incentive_type = request.data.get('type')
    note = request.data.get('note', '')

    # 3. Validation
    if not all([agent_id, amount, incentive_type]):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 4. The Critical Fix: Changed 'id' to 'emp_id'
        agent = Employee.objects.get(emp_id=agent_id, role='agent')
        
        # 5. Create the Record
        incentive = Incentive.objects.create(
            agent=agent,
            amount=amount,
            type=incentive_type,
            date_earned=timezone.now().date()
        )
        
        return Response({
            "message": f"Successfully awarded ₹{amount} to {agent.username}",
            "incentive_id": incentive.id # This is the ID of the NEW incentive record
        }, status=status.HTTP_201_CREATED)

    except Employee.DoesNotExist:
        return Response({"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # This will help you catch any other hidden issues
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AgentEarningsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        agent = request.user
        
        # 1. Get Parameters (Defaults to current date)
        view_type = request.query_params.get('view', 'weekly')
        try:
            target_month = int(request.query_params.get('month', timezone.now().month))
            target_year = int(request.query_params.get('year', timezone.now().year))
        except ValueError:
            return Response({"error": "Invalid date parameters"}, status=400)

        # 2. Date Range Logic
        # Get the first and last day of the selected month
        last_day = calendar.monthrange(target_year, target_month)[1]
        start_date = date(target_year, target_month, 1)
        end_date = date(target_year, target_month, last_day)

        # 3. Aggregations for the Selected Month
        monthly_qs = Incentive.objects.filter(
            agent=agent,
            date_earned__range=[start_date, end_date]
        )
        
        total_incentives = monthly_qs.aggregate(Sum('amount'))['amount__sum'] or 0
        base_salary = getattr(agent, 'base_salary', 20000)

        # 4. Dynamic Chart Logic
        if view_type == 'monthly':
            # Trend for the entire target year
            chart_qs = Incentive.objects.filter(
                agent=agent, 
                date_earned__year=target_year
            ).annotate(month_point=TruncMonth('date_earned')) \
             .values('month_point').annotate(total=Sum('amount')).order_by('month_point')

            chart_data = [
                {"name": item['month_point'].strftime("%b"), "value": float(item['total'])} 
                for item in chart_qs
            ]
        else:
            # Trend for the weeks of the selected month
            chart_qs = monthly_qs.annotate(week_point=TruncWeek('date_earned')) \
                .values('week_point').annotate(total=Sum('amount')).order_by('week_point')

            chart_data = [
                {"name": f"Week {i+1}", "value": float(item['total'])} 
                for i, item in enumerate(chart_qs)
            ]

        # 5. Checklist & History (Contextual to selected month)
        earned_types = monthly_qs.values_list('type', flat=True)
        checklist = [
            {"label": "Monthly Target Achieved", "amount": "₹3,000", "checked": 'monthly_target' in earned_types},
            {"label": "Weekly Bonus", "amount": "₹500", "checked": 'weekly_bonus' in earned_types},
            {"label": "Performance Bonus", "amount": "₹1,000", "checked": 'performance' in earned_types},
            {"label": "Login Bonus", "amount": "₹500", "checked": 'attendance' in earned_types},
        ]
        
        recent_history = IncentiveSerializer(monthly_qs.order_by('-date_earned')[:5], many=True).data

        return Response({
            "summary": {
                "total_earnings": float(base_salary) + float(total_incentives),
                "base_salary": float(base_salary),
                "total_incentives": float(total_incentives),
                "month_display": start_date.strftime("%B %Y")
            },
            "chart_data": chart_data if chart_data else [{"name": "No Data", "value": 0}],
            "checklist": checklist,
            "recent_history": recent_history
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_agents(request):
    try:
        print(f"--- DEBUG: Request from user {request.user.username} ---")
        
        # 1. Safer role check
        user_role = getattr(request.user, 'role', None)
        # If using a separate Employee profile, try: 
        # user_role = getattr(request.user.employee, 'role', None)
        
        print(f"--- DEBUG: User role detected: {user_role} ---")

        if user_role not in ['owner', 'lead']:
            return Response({"error": "Unauthorized"}, status=403)

        # 2. Fetch agents
        # We wrap this in a list() to force the database query to happen NOW
        agents_queryset = Employee.objects.filter(role='agent').values('emp_id', 'username', 'name', 'base_salary')
        agents_list = list(agents_queryset)
        
        print(f"--- DEBUG: Successfully found {len(agents_list)} agents ---")
        return Response(agents_list, status=200)

    except Exception as e:
        # THIS WILL SHOW IN YOUR DOCKER LOGS
        print("!!! CRITICAL VIEW ERROR !!!")
        import traceback
        print(traceback.format_exc()) 
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_finance_summary(request):
    # Potential 500 trigger: Check if 'role' is directly on the User model.
    # If role is on an 'Employee' profile linked to the user, 
    # you might need request.user.employee.role
    if getattr(request.user, 'role', None) not in ['owner', 'lead']:
        return Response({"error": "Unauthorized"}, status=403)

    # 1. Calculate Total Base Salaries
    # Note: .aggregate returns a dict like {'base_salary__sum': None} if no records exist
    res_base = Employee.objects.filter(role='agent').aggregate(Sum('base_salary'))
    total_base = res_base.get('base_salary__sum') or 0

    # 2. Calculate Monthly Incentives
    today = timezone.now().date()
    start_date = today.replace(day=1)
    # Get last day of current month safely
    last_day = calendar.monthrange(today.year, today.month)[1]
    end_date = today.replace(day=last_day)

    res_inc = Incentive.objects.filter(
        date_earned__range=[start_date, end_date]
    ).aggregate(Sum('amount'))
    total_incentives = res_inc.get('amount__sum') or 0

    return Response({
        "total_base_salaries": float(total_base),
        "total_incentives": float(total_incentives),
        "grand_total": float(total_base + total_incentives),
        "month_name": today.strftime("%B %Y")
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_payout_history(request):
    if getattr(request.user, 'role', None) not in ['owner', 'lead']:
        return Response({"error": "Unauthorized"}, status=403)

    # select_related('agent') only works if 'agent' is a ForeignKey on the Incentive model
    history = Incentive.objects.select_related('agent').all().order_by('-date_earned', '-id')
    
    data = []
    for item in history:
        # Check for None values to prevent .strftime() or .replace() crashes
        agent_name = "Unknown"
        if item.agent:
            agent_name = getattr(item.agent, 'name', None) or getattr(item.agent, 'username', 'Unknown')

        data.append({
            "id": item.id,
            "agent_name": agent_name,
            "amount": float(item.amount or 0),
            "type": (item.type or "bonus").replace('_', ' ').title(),
            "date": item.date_earned.strftime("%d %b %Y") if item.date_earned else "N/A"
        })
    
    return Response(data, status=200)