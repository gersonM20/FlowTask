import { useState, useEffect } from "react";
import "../styles/taskForm.css";

const EMPTY = {
  title:       "",
  description: "",
  status:      "pending",
  priority:    "medium",
  due_date:    "",
  category_id: "",
  user_id:     "",
};

export default function TaskForm({ task, categories, users, onSave, onClose }) {
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  // Populate form when editing an existing task
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || "",
        description: task.description || "",
        status:      task.status      || "pending",
        priority:    task.priority    || "medium",
        due_date:    task.due_date    ? task.due_date.slice(0, 10) : "",
        category_id: task.category_id ?? "",
        user_id:     task.user_id     || "",
      });
    } else {
      setForm({ ...EMPTY, user_id: users[0]?.id || "" });
    }
  }, [task, users]);

  const handle = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        due_date:    form.due_date    || null,
        category_id: form.category_id || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={task ? "Edit task" : "New task"}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="tf-title">Title *</label>
            <input
              id="tf-title"
              type="text"
              value={form.title}
              onChange={handle("title")}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tf-desc">Description</label>
            <textarea
              id="tf-desc"
              value={form.description}
              onChange={handle("description")}
              placeholder="Optional details…"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tf-status">Status</label>
              <select id="tf-status" value={form.status} onChange={handle("status")}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tf-priority">Priority</label>
              <select id="tf-priority" value={form.priority} onChange={handle("priority")}>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tf-due">Due Date</label>
              <input id="tf-due" type="date" value={form.due_date} onChange={handle("due_date")} />
            </div>

            <div className="form-group">
              <label htmlFor="tf-category">Category</label>
              <select id="tf-category" value={form.category_id} onChange={handle("category_id")}>
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tf-user">Assigned to</label>
            <select id="tf-user" value={form.user_id} onChange={handle("user_id")} required>
              <option value="">Select user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
