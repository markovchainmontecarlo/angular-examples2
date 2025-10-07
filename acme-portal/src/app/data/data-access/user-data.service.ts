import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { injectQuery, injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { queryKeys } from '../keys/query-keys';
import { User } from '../models/user.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private http = inject(HttpClient);
  private queryClient = injectQueryClient();

  private readonly API_URL = 'https://jsonplaceholder.typicode.com';

  // Query for fetching all users with staleTime and gcTime
  usersQuery = injectQuery(() => ({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      return lastValueFrom(
        this.http.get<User[]>(`${this.API_URL}/users`)
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  }));

  // Query for fetching a single user by ID
  userQuery(id: number) {
    return injectQuery(() => ({
      queryKey: queryKeys.users.detail(id),
      queryFn: async () => {
        return lastValueFrom(
          this.http.get<User>(`${this.API_URL}/users/${id}`)
        );
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    }));
  }

  // Mutation for creating a user with query invalidation
  createUserMutation = injectMutation(() => ({
    mutationFn: async (user: Omit<User, 'id'>) => {
      return lastValueFrom(
        this.http.post<User>(`${this.API_URL}/users`, user)
      );
    },
    onSuccess: () => {
      // Invalidate users query to refetch the list
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  }));

  // Mutation for updating a user
  updateUserMutation = injectMutation(() => ({
    mutationFn: async (user: User) => {
      return lastValueFrom(
        this.http.put<User>(`${this.API_URL}/users/${user.id}`, user)
      );
    },
    onSuccess: (data: User) => {
      // Invalidate both the list and the specific user detail
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
    },
  }));

  // Mutation for deleting a user
  deleteUserMutation = injectMutation(() => ({
    mutationFn: async (id: number) => {
      return lastValueFrom(
        this.http.delete(`${this.API_URL}/users/${id}`)
      );
    },
    onSuccess: (_: unknown, id: number) => {
      // Invalidate users queries
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      this.queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  }));
}
