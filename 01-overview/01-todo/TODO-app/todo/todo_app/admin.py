from django.contrib import admin

from .models import Todo


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
  list_display = ("title", "due_date", "priority", "is_resolved", "updated_at")
  list_filter = ("is_resolved", "due_date", "priority")
  search_fields = ("title", "notes")
