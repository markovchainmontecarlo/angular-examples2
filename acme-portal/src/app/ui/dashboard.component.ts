import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDataService } from '../data/data-access/user-data.service';
import { TodoDataService } from '../data/data-access/todo-data.service';
import { UiStore } from '../state/ui.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard" [attr.data-theme]="uiStore.theme()">
      <header class="header">
        <h1>Acme Portal Dashboard</h1>
        <div class="controls">
          <button (click)="uiStore.toggleTheme()" class="btn">
            Toggle Theme ({{ uiStore.theme() }})
          </button>
          <button (click)="uiStore.toggleSidebar()" class="btn">
            {{ uiStore.sidebarCollapsed() ? 'Expand' : 'Collapse' }} Sidebar
          </button>
        </div>
      </header>

      <div class="content">
        <aside class="sidebar" [class.collapsed]="uiStore.sidebarCollapsed()">
          <h2>Users</h2>
          <div class="search-box">
            <input
              type="text"
              placeholder="Search users..."
              [value]="uiStore.searchTerm()"
              (input)="uiStore.setSearchTerm($any($event.target).value)"
              class="search-input"
            />
          </div>
          
          @if (userDataService.usersQuery.isPending()) {
            <div class="loading">Loading users...</div>
          } @else if (userDataService.usersQuery.isError()) {
            <div class="error">Error loading users</div>
          } @else if (userDataService.usersQuery.data()) {
            <ul class="user-list">
              @for (user of filteredUsers(); track user.id) {
                <li
                  [class.selected]="user.id === uiStore.selectedUserId()"
                  (click)="uiStore.selectUser(user.id)"
                  class="user-item"
                >
                  <strong>{{ user.name }}</strong>
                  <small>{{ user.email }}</small>
                </li>
              }
            </ul>
          }
        </aside>

        <main class="main">
          <div class="todos-section">
            <div class="todos-header">
              <h2>Todos</h2>
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="uiStore.showCompletedTodos()"
                  (change)="uiStore.toggleCompletedTodos()"
                />
                Show Completed
              </label>
            </div>

            @if (uiStore.selectedUserId()) {
              <p class="info">
                Showing todos for user ID: {{ uiStore.selectedUserId() }}
              </p>
            }

            @if (todoDataService.todosQuery.isPending()) {
              <div class="loading">Loading todos...</div>
            } @else if (todoDataService.todosQuery.isError()) {
              <div class="error">Error loading todos</div>
            } @else if (todoDataService.todosQuery.data()) {
              <div class="todos-list">
                @for (todo of filteredTodos(); track todo.id) {
                  <div class="todo-item" [class.completed]="todo.completed">
                    <input
                      type="checkbox"
                      [checked]="todo.completed"
                      (change)="toggleTodo(todo)"
                    />
                    <span class="todo-title">{{ todo.title }}</span>
                    <button (click)="deleteTodo(todo.id)" class="btn-delete">
                      Delete
                    </button>
                  </div>
                }
              </div>

              <div class="stats">
                <p>Total: {{ filteredTodos().length }} todos</p>
                <p>Completed: {{ completedCount() }}</p>
                <p>Pending: {{ pendingCount() }}</p>
              </div>
            }
          </div>

          <div class="cache-info">
            <h3>TanStack Query Cache Info</h3>
            <p><strong>Users Query:</strong></p>
            <ul>
              <li>Status: {{ userDataService.usersQuery.status() }}</li>
              <li>Is Fetching: {{ userDataService.usersQuery.isFetching() }}</li>
              <li>Is Stale: {{ userDataService.usersQuery.isStale() }}</li>
              <li>Data Updated At: {{ userDataService.usersQuery.dataUpdatedAt() | date:'medium' }}</li>
            </ul>
            
            <p><strong>Todos Query:</strong></p>
            <ul>
              <li>Status: {{ todoDataService.todosQuery.status() }}</li>
              <li>Is Fetching: {{ todoDataService.todosQuery.isFetching() }}</li>
              <li>Is Stale: {{ todoDataService.todosQuery.isStale() }}</li>
              <li>Data Updated At: {{ todoDataService.todosQuery.dataUpdatedAt() | date:'medium' }}</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard[data-theme="dark"] {
      background: #1a1a1a;
      color: #e0e0e0;
    }

    .header {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .controls {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn:hover {
      background: #2980b9;
    }

    .content {
      display: flex;
      min-height: calc(100vh - 80px);
    }

    .sidebar {
      width: 300px;
      background: white;
      border-right: 1px solid #ddd;
      padding: 1.5rem;
      overflow-y: auto;
      transition: width 0.3s;
    }

    .dashboard[data-theme="dark"] .sidebar {
      background: #2a2a2a;
      border-right-color: #444;
    }

    .sidebar.collapsed {
      width: 60px;
      padding: 1rem;
    }

    .sidebar.collapsed h2,
    .sidebar.collapsed .search-box,
    .sidebar.collapsed .user-list {
      display: none;
    }

    .search-box {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .dashboard[data-theme="dark"] .search-input {
      background: #333;
      border-color: #555;
      color: #e0e0e0;
    }

    .user-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .user-item {
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dashboard[data-theme="dark"] .user-item {
      border-color: #444;
    }

    .user-item:hover {
      background: #f8f9fa;
      border-color: #3498db;
    }

    .dashboard[data-theme="dark"] .user-item:hover {
      background: #333;
    }

    .user-item.selected {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .dashboard[data-theme="dark"] .user-item.selected {
      background: #1e3a5f;
    }

    .user-item strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .user-item small {
      color: #666;
      font-size: 0.75rem;
    }

    .dashboard[data-theme="dark"] .user-item small {
      color: #aaa;
    }

    .main {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .todos-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .dashboard[data-theme="dark"] .todos-section {
      background: #2a2a2a;
    }

    .todos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .dashboard[data-theme="dark"] .todos-header {
      border-bottom-color: #444;
    }

    .todos-header h2 {
      margin: 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .info {
      background: #e3f2fd;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border-left: 4px solid #2196f3;
    }

    .dashboard[data-theme="dark"] .info {
      background: #1e3a5f;
    }

    .todos-list {
      margin-bottom: 1.5rem;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .dashboard[data-theme="dark"] .todo-item {
      border-color: #444;
    }

    .todo-item:hover {
      background: #f8f9fa;
    }

    .dashboard[data-theme="dark"] .todo-item:hover {
      background: #333;
    }

    .todo-item.completed .todo-title {
      text-decoration: line-through;
      color: #999;
    }

    .todo-title {
      flex: 1;
    }

    .btn-delete {
      padding: 0.25rem 0.75rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .stats {
      display: flex;
      gap: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .dashboard[data-theme="dark"] .stats {
      background: #333;
    }

    .stats p {
      margin: 0;
      font-weight: 500;
    }

    .cache-info {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dashboard[data-theme="dark"] .cache-info {
      background: #2a2a2a;
    }

    .cache-info h3 {
      margin-top: 0;
      color: #2c3e50;
    }

    .dashboard[data-theme="dark"] .cache-info h3 {
      color: #e0e0e0;
    }

    .cache-info ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .cache-info li {
      margin-bottom: 0.25rem;
    }

    .loading {
      padding: 2rem;
      text-align: center;
      color: #666;
    }

    .dashboard[data-theme="dark"] .loading {
      color: #aaa;
    }

    .error {
      padding: 1rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
    }

    .dashboard[data-theme="dark"] .error {
      background: #4a1c1c;
      border-color: #6a2c2c;
      color: #ff6b6b;
    }
  `]
})
export class DashboardComponent {
  userDataService = inject(UserDataService);
  todoDataService = inject(TodoDataService);
  uiStore = inject(UiStore);

  filteredUsers = computed(() => {
    const users = this.userDataService.usersQuery.data() || [];
    const searchTerm = this.uiStore.searchTerm().toLowerCase();
    
    if (!searchTerm) {
      return users;
    }
    
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  filteredTodos = computed(() => {
    const todos = this.todoDataService.todosQuery.data() || [];
    const selectedUserId = this.uiStore.selectedUserId();
    const showCompleted = this.uiStore.showCompletedTodos();
    
    let filtered = todos;
    
    if (selectedUserId) {
      filtered = filtered.filter(todo => todo.userId === selectedUserId);
    }
    
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    return filtered;
  });

  completedCount = computed(() => {
    return this.filteredTodos().filter(todo => todo.completed).length;
  });

  pendingCount = computed(() => {
    return this.filteredTodos().filter(todo => !todo.completed).length;
  });

  toggleTodo(todo: any) {
    this.todoDataService.toggleTodoMutation.mutate(todo);
  }

  deleteTodo(id: number) {
    this.todoDataService.deleteTodoMutation.mutate(id);
  }
}
