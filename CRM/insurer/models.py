from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Count
from django.db.models.signals import post_save
from django.dispatch import receiver


# "Employees Table" : emp_id, name, phone, email_id, address, role(lead/agent/admin), is_active, date_joined, last_login
class EmployeeManager(BaseUserManager):
    """The EmployeeManager class takes care of the creation of users"""
    def create_user(self, username, password = None ,**otherFields): 
        """This function runs whenever create_user is called"""
        if not username:
            raise ValueError("Username is required")
        
        user = self.model(username=username, **otherFields)
        user.set_password(password)  #hashes password
        user.save(using = self._db)
        return user
    
    def create_superuser(self, username, password = None, **extraFields): 
        """This function runs when we use manage.py createsuperuser"""
        extraFields.setdefault("role", "owner")
        extraFields.setdefault("is_staff",True)
        extraFields.setdefault("is_superuser",True)
        return self.create_user(username, password, **extraFields)
    
    
class Employee(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('lead', 'Lead'),
        ('agent', 'Agent'),
    ]

    emp_id = models.AutoField(primary_key=True)

    username = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=10)
    email = models.EmailField(unique=True)
    address = models.TextField()

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField(default = 0)
    objects = EmployeeManager()
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=10000.00)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "name"]


    def __str__(self):
        return f"{self.name} - {self.role}"




class Lead(models.Model):
    INSURANCE_TYPES = (('motor', 'Motor'), ('health', 'Health'), ('life', 'Life'))
    PRIORITY_CHOICES = (('hot', 'Hot'), ('warm', 'Warm'), ('cold', 'Cold'))
    
    # Existing Fields
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    insurance_type = models.CharField(max_length=10, choices=INSURANCE_TYPES)
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    assigned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='hot')
    status = models.CharField(
        max_length=20,
        choices=[
            ("new","New"),
            ("follow_up","Follow Up"),
            ("converted","Converted"),
            ("not_interested","Not Interested"), # Unified with your logic
        ],
        default="new",
        db_index=True
    )

    # 🛡️ THE MISSING FIELD: This is why your "Paid" tab was empty
    payment_status = models.CharField(
        max_length=10, 
        choices=(('pending', 'Pending'), ('paid', 'Paid')), 
        default='pending'
    )

    def update_priority(self):
        now = timezone.now()
        
        # 1. EARLY EXIT: Don't calculate for closed leads
        if self.status in ['converted', 'not_interested']:
            if self.priority != 'cold':
                self.priority = 'cold'
                self.save(update_fields=['priority'])
            return

        # 2. DATA GATHERING
        followup_count = self.followups.count()
        age_in_hours = (now - self.created_at).total_seconds() / 3600

        # 3. RULE: Scheduled Urgency (Persistent Hot)
        is_urgent = self.followups.filter(
            follow_up_status='pending',
            follow_up_date__lte=now + timedelta(hours=2)
        ).exists()

        # 4. THE PRIORITY CHAIN
        if is_urgent:
            new_priority = 'hot'
        elif followup_count >= 3:
            new_priority = 'cold'
        elif 0 < followup_count < 3:
            new_priority = 'warm'
        elif followup_count == 0:
            if age_in_hours <= 24:
                new_priority = 'hot'
            elif age_in_hours <= 48:
                new_priority = 'warm'
            else:
                new_priority = 'cold'
        else:
            new_priority = 'warm'

        # 5. SAVE CHANGES
        if self.priority != new_priority:
            self.priority = new_priority
            self.save(update_fields=['priority'])

class MotorLead(models.Model):

    lead = models.OneToOneField(
        Lead,
        on_delete=models.CASCADE,
        related_name='motor_details'
    )
    chassis_number = models.CharField(max_length=50)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    rto_location = models.CharField(max_length=50)
    vehicle_number = models.CharField(max_length=50)
    vehicle_type = models.CharField(max_length=50)
    policy_expiry = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.vehicle_number
    

class HealthLead(models.Model):

    lead = models.OneToOneField(
        Lead,
        on_delete=models.CASCADE,
        related_name='health_details'
    )

    gender = models.CharField(max_length=50)
    medical_history = models.TextField(null=True,blank=True)
    sum_insured = models.FloatField()
    policy_type = models.CharField(max_length=50)
    age = models.IntegerField()
    family_members = models.IntegerField(null=True, blank=True)
    existing_disease = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Health Lead {self.lead.name}"
    

class LifeLead(models.Model):

    lead = models.OneToOneField(
        Lead,
        on_delete=models.CASCADE,
        related_name='life_details'
    )
    occupation = models.CharField(max_length=50)
    nominee_name = models.CharField(max_length=50)
    nominee_relation = models.CharField(max_length=50)
    policy_term = models.IntegerField()
    sum_assured = models.FloatField()

    age = models.IntegerField()
    annual_income = models.FloatField(null=True, blank=True)
    smoker = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Life Lead {self.lead.name}"
    


class FollowUp(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('missed', 'Missed')
    ]

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="followups"
    )

    assigned_agent = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True
    )

    call_date = models.DateTimeField()

    follow_up_date = models.DateTimeField(null=True, blank=True)

    follow_up_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    notes = models.TextField(blank=True, null=True)

    iteration_count = models.IntegerField(default=1)

    next_action = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)


class Insurance(models.Model):

    insurance_name = models.CharField(max_length=200, db_index=True)

    insurance_provider = models.CharField(max_length=200)

    coverage_amount = models.FloatField()

    premium = models.FloatField()

    tenure = models.IntegerField()


    def __str__(self):
        return f"{self.insurance_name} - {self.insurance_provider}"
    

class Conversion(models.Model):

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE
    )

    insurance = models.ForeignKey(
        Insurance,
        on_delete=models.SET_NULL,
        null=True
    )

    agent = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True
    )

    policy_start_date = models.DateField()

    policy_end_date = models.DateField()

    premium_amount = models.FloatField()

    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("pending","Pending"),
            ("paid","Paid")
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)


class Document(models.Model):

    conversion = models.ForeignKey(
        Conversion,
        on_delete=models.CASCADE
    )

    document_type = models.CharField(max_length=100)

    file = models.FileField(upload_to="documents/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    verified_status = models.BooleanField(default=False)


class Score(models.Model):

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["agent", "date"],
                name="unique_agent_score_per_day"
            )]


    agent = models.ForeignKey(
        'Employee', # or your User model name
        on_delete=models.CASCADE, 
        related_name='score_records' 
    )

    date = models.DateField()

    daily_target = models.IntegerField()

    achieved_score = models.IntegerField()

    leads_converted = models.IntegerField(default=0)

    calls_made = models.IntegerField(default=0)

    conversion_rate = models.FloatField(default=0)

    target_met = models.BooleanField(default=False)


class DailyOverallPerformance(models.Model):
    date = models.DateField(primary_key=True)
    total_calls = models.IntegerField(default=0)
    total_conversions = models.IntegerField(default=0)
    total_target = models.IntegerField(default=100)
    connected_calls = models.IntegerField(default=0)

    @property
    def overall_conversion_rate(self):
        if self.connected_calls > 0:
            return (self.total_conversions / self.connected_calls) * 100
        return 0

# Change this in models.py
class Attendance(models.Model):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('late', 'Late')]
    agent = models.ForeignKey(Employee, on_delete=models.CASCADE)
    
    # REMOVE auto_now_add=True
    date = models.DateField() 
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    check_in = models.TimeField(null=True, blank=True)


class LeaveRequest(models.Model):
    agent = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=50) # e.g., Vacation, Sick
    status = models.CharField(max_length=20, default='Pending') # Pending, Approved, Rejected
    request_date = models.DateField(auto_now_add=True)

# Add these to models.py

class RecruitmentStats(models.Model):
    """Stores the numbers for the Recruitment Status card"""
    open_positions = models.IntegerField(default=0)
    interviews_scheduled = models.IntegerField(default=0)
    hires_in_progress = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

class AdminTask(models.Model):
    """Stores the checkboxes for the 'Manage Payroll Tasks' section"""
    label = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']


class Incentive(models.Model):
    # The types of bonuses you want to show on the Checklist/Table
    INCENTIVE_TYPES = [
        ('monthly_target', 'Monthly Target Achieved'),
        ('weekly_bonus', 'Weekly Bonus'),
        ('performance', 'Performance Bonus'),
        ('attendance', 'Login/Attendance Bonus'),
    ]

    agent = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='incentives')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=INCENTIVE_TYPES)
    
    # This helps the "Weekly Bar Chart" know which week to put the bar in
    date_earned = models.DateField(default=timezone.now)
    
    description = models.CharField(max_length=255, blank=True)
    is_paid = models.BooleanField(default=False) # For tracking if it was included in their paycheck

    class Meta:
        ordering = ['-date_earned']

    def __str__(self):
        return f"{self.agent.name} - {self.get_type_display()} - ₹{self.amount}"
    


@receiver(post_save, sender=Employee)
def distribute_leads_to_new_agent(sender, instance, created, **kwargs):
    """
    When a new Agent is created, 'tax' existing agents to give the
    newcomer a fair share of unworked leads.
    """
    # 1. Only run for new, active users with the 'agent' role
    if created and instance.is_active and instance.role == 'agent':
        with transaction.atomic():
            # 2. Get all active agents (the 'workforce')
            active_agents = Employee.objects.filter(is_active=True, role='agent')
            total_agents = active_agents.count()

            # 3. Find only 'new' status leads
            fresh_leads = Lead.objects.filter(status='new')
            total_fresh_leads = fresh_leads.count()

            if total_fresh_leads == 0 or total_agents <= 1:
                return 

            # 4. Calculate the 'Fair Share'
            fair_share = total_fresh_leads // total_agents
            if fair_share < 1:
                return 

            current_leads_to_move = []
            
            # 5. Collect excess from others
            for agent in active_agents.exclude(emp_id=instance.emp_id):
                # FIX: Changed 'agent' to 'assigned_to' to match your model
                agent_leads = fresh_leads.filter(assigned_to=agent)
                agent_lead_count = agent_leads.count()
                
                excess = agent_lead_count - fair_share
                if excess > 0:
                    spare_leads = agent_leads.values_list('id', flat=True)[:excess]
                    current_leads_to_move.extend(list(spare_leads))

            # 6. Final Handover
            leads_to_assign_ids = current_leads_to_move[:fair_share]
            # FIX: Changed 'agent' to 'assigned_to'
            Lead.objects.filter(id__in=leads_to_assign_ids).update(assigned_to=instance)

            print(f"🚀 REBALANCE: {len(leads_to_assign_ids)} leads moved to new agent: {instance.name}")



class Task(models.Model):
    # Link to Lead object for data integrity
    lead = models.ForeignKey('Lead', on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    agent = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='tasks')
    
    title = models.CharField(max_length=255)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    # Set a default to prevent crashes during task creation
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    note = models.TextField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.priority})"

    @property
    def overdue(self):
        from django.utils import timezone
        return (not self.is_completed) and (self.due_date < timezone.now().date())



class AgentBreak(models.Model):
    agent = models.ForeignKey('Employee', on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    # New field to track system-detected idle time
    is_unmentioned = models.BooleanField(default=False) 

    @property
    def duration_display(self):
        if self.end_time:
            diff = self.end_time - self.start_time
            minutes, seconds = divmod(diff.seconds, 60)
            return f"{minutes}m {seconds}s"
        return "In Progress"