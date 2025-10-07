import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { injectQuery, injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { queryKeys } from '../keys/query-keys';
import { Todo } from '../models/todo.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoDataService {
  private http = inject(HttpClient);
  private queryClient = injectQueryClient();

  private readonly API_URL = 'https://jsonplaceholder.typicode.com';

  // Query for fetching all todos with staleTime and gcTime
  todosQuery = injectQuery(() => ({
    queryKey: queryKeys.todos.all,
    queryFn: async () => {
      return lastValueFrom(
        this.http.get<Todo[]>(`${this.API_URL}/todos?_limit=10`)
      );
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  }));

  // Query for fetching todos by user ID
  todosByUserQuery(userId: number) {
    return injectQuery(() => ({
      queryKey: queryKeys.todos.list(`userId=${userId}`),
      queryFn: async () => {
        return lastValueFrom(
          this.http.get<Todo[]>(`${this.API_URL}/todos?userId=${userId}`)
        );
      },
      staleTime: 1000 * 60 * 3, // 3 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    }));
  }

  // Mutation for creating a todo
  createTodoMutation = injectMutation(() => ({
    mutationFn: async (todo: Omit<Todo, 'id'>) => {
      return lastValueFrom(
        this.http.post<Todo>(`${this.API_URL}/todos`, todo)
      );
    },
    onSuccess: () => {
      // Invalidate todos query to refetch the list
      this.queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  }));

  // Mutation for updating a todo
  updateTodoMutation = injectMutation(() => ({
    mutationFn: async (todo: Todo) => {
      return lastValueFrom(
        this.http.put<Todo>(`${this.API_URL}/todos/${todo.id}`, todo)
      );
    },
    onSuccess: () => {
      // Invalidate todos queries
      this.queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  }));

  // Mutation for toggling todo completion
  toggleTodoMutation = injectMutation(() => ({
    mutationFn: async (todo: Todo) => {
      return lastValueFrom(
        this.http.patch<Todo>(`${this.API_URL}/todos/${todo.id}`, {
          completed: !todo.completed
        })
      );
    },
    onSuccess: () => {
      // Invalidate todos queries
      this.queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  }));

  // Mutation for deleting a todo
  deleteTodoMutation = injectMutation(() => ({
    mutationFn: async (id: number) => {
      return lastValueFrom(
        this.http.delete(`${this.API_URL}/todos/${id}`)
      );
    },
    onSuccess: () => {
      // Invalidate todos queries
      this.queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  }));
}
