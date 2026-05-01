from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    Login,
    create_employee,
    view_employees,
    upload_leads,
    agent_leads,
    lead_detail,
    process_lead,
    await_lead,
    admin_current_score,
    agent_dashboard_stats,
    log_call,
    admin_mega_dashboard,
    check_in,
    close_lead,
    mark_as_paid,
    update_agent_salary,
    admin_award_incentive,
    get_all_agents,
    AgentEarningsDashboardView
)

urlpatterns = [

    # Authentication
    path("user/login", Login.as_view(), name="login"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),


    # Admin APIs
    path("admin/create-user", create_employee, name="create_employee"),
    path("admin/employees", view_employees, name="view_employees"),
    path("admin/upload-leads/", upload_leads, name="upload_leads"),
    path("admin/mega-dashboard/",admin_mega_dashboard, name="admin_dashboard" ),
    path('admin/current-score/', admin_current_score, name='admin_current_score'),
    path('admin/agents/', get_all_agents, name='list-agents'), # Need this for the dropdowns
    path('admin/update-salary/<int:agent_id>/', update_agent_salary, name='update-salary'),
    path('admin/award-incentive/', admin_award_incentive, name='award-incentive'),

    path("agent/leads/",agent_leads, name="agent_leads"),

    path("leads/<int:id>/",lead_detail, name="lead_detail"),

    path("agent/<int:id>/process/",process_lead, name="process_lead"),

    path("agent/<int:id>/await/",await_lead, name="await_lead"),

    path("agent/<int:id>/log-call/", log_call, name="log_call"),

    path("agent/dashboard-stats/", agent_dashboard_stats, name="agent_dashboard_stats"),

    path("agent/check-in/", check_in, name="check_in"),

    path("agent/<int:id>/close/",close_lead, name="close_lead" ),

    path("agent/<int:id>/mark-paid/",mark_as_paid, name="mark_paid"),

    path('agent/earnings-dashboard/', AgentEarningsDashboardView.as_view(), name='agent-earnings'),


]