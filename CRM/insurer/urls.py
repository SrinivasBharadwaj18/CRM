from django.urls import path
from django.contrib import admin
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
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [

    # Authentication
    path("api/user/login", Login.as_view(), name="login"),
    path("api/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/django-portal/", admin.site.urls),


    # Admin APIs
    path("api/admin/create-user", create_employee, name="create_employee"),
    path("api/admin/employees", view_employees, name="view_employees"),
    path("api/admin/upload-leads/", upload_leads, name="upload_leads"),
    path("api/admin/mega-dashboard/",admin_mega_dashboard, name="admin_dashboard" ),
    path('api/admin/current-score/', admin_current_score, name='admin_current_score'),
    path('api/admin/agents/', get_all_agents, name='list-agents'), # Need this for the dropdowns
    path('api/admin/update-salary/<int:agent_id>/', update_agent_salary, name='update-salary'),
    path('api/admin/award-incentive/', admin_award_incentive, name='award-incentive'),

    path("api/agent/leads/",agent_leads, name="agent_leads"),

    path("api/leads/<int:id>/",lead_detail, name="lead_detail"),

    path("api/agent/<int:id>/process/",process_lead, name="process_lead"),

    path("api/agent/<int:id>/await/",await_lead, name="await_lead"),

    path("api/agent/<int:id>/log-call/", log_call, name="log_call"),

    path("api/agent/dashboard-stats/", agent_dashboard_stats, name="agent_dashboard_stats"),

    path("api/agent/check-in/", check_in, name="check_in"),

    path("api/agent/<int:id>/close/",close_lead, name="close_lead" ),

    path("api/agent/<int:id>/mark-paid/",mark_as_paid, name="mark_paid"),

    path('api/agent/earnings-dashboard/', AgentEarningsDashboardView.as_view(), name='agent-earnings'),

    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),


]