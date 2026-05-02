from rest_framework import serializers
from .models import Employee, Lead, Conversion, FollowUp, MotorLead, HealthLead, LifeLead, Incentive


# Need to define these so LeadSerializer can use them
class MotorLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotorLead
        fields = '__all__'

class HealthLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthLead
        fields = '__all__'

class LifeLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeLead
        fields = '__all__'

class EmployeesSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    # These fields are "injected" by the annotate() in our view
    total_leads = serializers.IntegerField(read_only=True, default=0)
    total_conversions = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Employee
        fields = [
            "emp_id", "username", "password", "name", 
            "phone", "email", "address", "role", 
            "is_active", "is_staff", "date_joined",
            "total_leads", "total_conversions" # Include them here
        ]
        read_only_fields = ["emp_id", "date_joined"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Employee.objects.create_user(password=password, **validated_data)
        return user

class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = ['id', 'call_date', 'follow_up_date', 'notes', 'next_action', 'follow_up_status']

class LeadSerializer(serializers.ModelSerializer):
    motor_details = MotorLeadSerializer(read_only=True)
    health_details = HealthLeadSerializer(read_only=True)
    life_details = LifeLeadSerializer(read_only=True)
    followups = FollowUpSerializer(many=True, read_only=True)
    # New: Add plan_details if you are storing specific plan info
    # plan_details = PlanSerializer(read_only=True) 

    class Meta:
        model = Lead
        fields = [
            "id", "name", "phone", "email", "insurance_type", 
            "status", "priority", "payment_status", "assigned_at", "created_at",
            "motor_details", "health_details", "life_details", "followups"
        ]
    def get_next_follow_up(self, obj):
        # Grab only the single latest pending follow-up
        followup = obj.followups.filter(follow_up_status='pending').order_by('-follow_up_date').first()
        if followup:
            return followup.follow_up_date.strftime("%Y-%m-%d %H:%M")
        return None      

class IncentiveSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Incentive
        fields = ['id', 'type', 'type_display', 'amount', 'date_earned', 'description', 'is_paid']



from rest_framework import serializers
from .models import Task, Lead

class TaskSerializer(serializers.ModelSerializer):
    # This pulls the lead's name directly from the related Lead model
    # Use allow_null=True because some tasks might not be linked to a lead
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    
    # This pulls the agent's name/username for audit purposes
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    # We include the 'overdue' property we defined in the model
    overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'lead',       # The ID (for editing/links)
            'lead_name',  # The Name (for display in the table)
            'agent', 
            'agent_name',
            'due_date', 
            'priority', 
            'is_completed', 
            'overdue',    # Useful for the 'Overdue' tab logic
            'note', 
            'created_at'
        ]
        
        # 'agent' should be read_only if you are auto-assigning 
        # it to the logged-in user in the view.
        read_only_fields = ['id', 'created_at', 'overdue']

    def validate_due_date(self, value):
        """
        Optional: Ensure tasks aren't created for dates long in the past.
        """
        from django.utils import timezone
        if value < timezone.now().date():
            # We allow it (for back-logging), but you could raise an error here
            pass 
        return value






# from insurer.models import Employee

# # Create the management user
# admin_user = Employee.objects.create_superuser(
#     username='admin_boss',
#     email='admin@crm.com',
#     password='YourSecurePassword123',
#     name='Main Admin'
# )

# # Explicitly set the role so React recognizes it
# admin_user.role = 'owner'
# admin_user.save()

# exit()