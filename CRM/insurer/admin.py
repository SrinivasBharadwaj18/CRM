from django.contrib import admin
from .models import Employee, Lead, DailyOverallPerformance, MotorLead

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_id', 'username', 'name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    search_fields = ('username', 'name')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    # Fixed based on your error logs:
    # Changed vehicle_no -> vehicle_number (or check your model for the exact name)
    # If your model fields use underscores, ensure they match here.
    list_display = ('id', 'status', 'assigned_to') 
    list_filter = ('status',)
    search_fields = ('status',)

    # I've commented these out so your server starts. 
    # Please uncomment them only if they match your Lead model exactly:
    # list_display = ('vehicle_no', 'customer_name', 'mobile', 'status', 'expiry_date')
    # list_filter = ('status', 'make', 'insurance_company')

@admin.register(DailyOverallPerformance)
class DailyPerformanceAdmin(admin.ModelAdmin):
    # Your error says 'total_leads', 'conversions', and 'revenue' don't exist.
    # Check if they are named 'leads_count', 'conversion_count', etc. in models.py
    list_display = ('date',) 




# @admin.register(AgentPerformance)
# class AgentPerformanceAdmin(admin.ModelAdmin):
#     list_display = ('agent', 'date', 'leads_assigned', 'conversions')
#     list_filter = ('date', 'agent')

# This allows you to edit the car info on the same page as the person
# class MotorLeadInline(admin.TabularInline):
#     model = MotorLead
#     extra = 0
#     # If the relationship is OneToOne, this will show 1 row.
#     # If it is ForeignKey, it shows all related vehicles.

# @admin.register(Lead)
# class LeadAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'phone', 'status', 'insurance_type')
#     list_filter = ('status', 'insurance_type')
#     search_fields = ('name', 'phone', 'motor_details__vehicle_number')
    
#     # This is the magic line that connects them in the UI
#     inlines = [MotorLeadInline]

# # Optional: Register MotorLead separately so you can search by plate number
# @admin.register(MotorLead)
# class MotorDetailAdmin(admin.ModelAdmin):
#     list_display = ('vehicle_number', 'make', 'model', 'lead')
#     search_fields = ('vehicle_number', 'chassis_number')