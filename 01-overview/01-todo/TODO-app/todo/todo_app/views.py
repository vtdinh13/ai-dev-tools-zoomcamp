from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import CreateView, DeleteView, ListView, UpdateView

from .forms import TodoForm
from .models import Todo


class TodoListView(ListView):
  model = Todo
  template_name = "todo_app/todo_list.html"
  context_object_name = "todos"

  def get_queryset(self):
    qs = Todo.objects.all().order_by("is_resolved", "due_date", "-priority", "-updated_at")
    status = self.request.GET.get("status")
    if status == "resolved":
      qs = qs.filter(is_resolved=True)
    elif status == "active":
      qs = qs.filter(is_resolved=False)
    return qs

  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    totals = Todo.objects.aggregate(
        total=Count("id"),
        active=Count("id", filter=Q(is_resolved=False)),
        resolved=Count("id", filter=Q(is_resolved=True)),
    )
    context["totals"] = totals
    context["status_filter"] = self.request.GET.get("status", "all")
    context["filter_options"] = [("all", "All"), ("active", "Active"), ("resolved", "Resolved")]
    context["form"] = TodoForm()
    return context


class TodoCreateView(CreateView):
  model = Todo
  template_name = "todo_app/todo_form.html"
  form_class = TodoForm
  success_url = reverse_lazy("todo-list")


class TodoUpdateView(UpdateView):
  model = Todo
  template_name = "todo_app/todo_form.html"
  form_class = TodoForm
  success_url = reverse_lazy("todo-list")


class TodoDeleteView(DeleteView):
  model = Todo
  template_name = "todo_app/todo_confirm_delete.html"
  success_url = reverse_lazy("todo-list")


class TodoToggleResolvedView(View):
  def post(self, request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save(update_fields=["is_resolved", "updated_at"])
    return redirect("todo-list")
