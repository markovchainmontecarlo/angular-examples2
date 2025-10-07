# Acme Portal - Architecture Documentation

This project demonstrates the integration of **TanStack Query** for server-state management and **NgRx SignalStore** for UI/client state management in an Angular standalone application.

## 📁 Project Structure

```
src/app/
├── data/                       # Server state management
│   ├── keys/
│   │   └── query-keys.ts      # Centralized query key definitions
│   ├── models/
│   │   ├── user.model.ts      # User data model
│   │   └── todo.model.ts      # Todo data model
│   └── data-access/
│       ├── user-data.service.ts  # User data access with TanStack Query
│       └── todo-data.service.ts  # Todo data access with TanStack Query
├── state/                      # Client state management
│   └── ui.store.ts            # NgRx SignalStore for UI state
└── ui/                        # Presentation components
    └── dashboard.component.ts # Main dashboard component
```

## 🔧 Technology Stack

### Server State (TanStack Query)
- **Package**: `@tanstack/angular-query-experimental@^5.85.0`
- **Purpose**: Caching, synchronization, and management of server data
- **Features Used**:
  - `injectQuery()` - For data fetching with automatic caching
  - `injectMutation()` - For data mutations (create, update, delete)
  - Query invalidation for cache updates
  - `staleTime` and `gcTime` configuration

### Client State (NgRx SignalStore)
- **Package**: `@ngrx/signals`
- **Purpose**: Managing UI state (selections, filters, preferences)
- **Features Used**:
  - `signalStore()` - Creating reactive state stores
  - `withState()` - Defining state shape
  - `withMethods()` - Creating state update methods
  - `patchState()` - Immutable state updates

## 🎯 Key Implementation Details

### 1. Query Keys (`data/keys/query-keys.ts`)
Centralized query key factory following best practices:
```typescript
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  // Similar structure for todos
};
```

### 2. Data Access Services
Services use TanStack Query with proper configuration:

**Queries** (Read Operations):
- `staleTime: 5 minutes` - Data considered fresh for 5 minutes
- `gcTime: 10 minutes` - Unused cache kept for 10 minutes
- Automatic background refetching when stale

**Mutations** (Write Operations):
- Optimistic updates capability
- Query invalidation on success
- Automatic cache updates

Example:
```typescript
usersQuery = injectQuery(() => ({
  queryKey: queryKeys.users.all,
  queryFn: async () => { /* fetch logic */ },
  staleTime: 1000 * 60 * 5,  // 5 minutes
  gcTime: 1000 * 60 * 10,     // 10 minutes
}));

createUserMutation = injectMutation(() => ({
  mutationFn: async (user) => { /* create logic */ },
  onSuccess: () => {
    // Invalidate to trigger refetch
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.users.all 
    });
  },
}));
```

### 3. UI State Store (`state/ui.store.ts`)
SignalStore manages all client-side UI state:
```typescript
export interface UiState {
  selectedUserId: number | null;
  showCompletedTodos: boolean;
  searchTerm: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}
```

Methods for state updates:
- `selectUser(userId)` - Select a user to filter todos
- `toggleCompletedTodos()` - Show/hide completed todos
- `setSearchTerm(term)` - Filter users by search
- `toggleSidebar()` - Expand/collapse sidebar
- `toggleTheme()` - Switch between light/dark mode

### 4. Dashboard Component (`ui/dashboard.component.ts`)
Demonstrates integration of both state management solutions:

**Server State (TanStack Query)**:
- Displays loading/error/success states
- Shows cache metadata (status, fetching, stale, updateTime)
- Performs mutations with automatic cache updates

**Client State (NgRx SignalStore)**:
- Reactive computed values for filtering
- Theme and layout preferences
- User selections and search

**Computed Values**:
```typescript
filteredUsers = computed(() => {
  const users = this.userDataService.usersQuery.data() || [];
  const searchTerm = this.uiStore.searchTerm();
  return users.filter(/* filter logic */);
});
```

## 🔄 Data Flow

### Query Flow
1. Component injects data service
2. Service provides query signal from TanStack Query
3. Component reads query state: `data()`, `isPending()`, `isError()`
4. TanStack Query manages caching, refetching, and stale time
5. Cache info displayed for transparency

### Mutation Flow
1. User action triggers mutation
2. Mutation function executes
3. On success, relevant queries are invalidated
4. TanStack Query automatically refetches affected data
5. UI updates reactively

### UI State Flow
1. User interaction (click, input, etc.)
2. Call SignalStore method
3. State updates via `patchState()`
4. Computed signals recalculate
5. Template updates automatically

## 📝 Configuration

### App Config (`app.config.ts`)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),                    // HTTP client for API calls
    provideTanStackQuery(new QueryClient()) // TanStack Query setup
  ]
};
```

### Query Client Configuration
Default configuration with sensible defaults:
- Automatic retries on failure
- Garbage collection of unused cache
- Background refetching when window refocuses
- Network status monitoring

## 🎨 Features Demonstrated

1. **Server State Caching**: Users and todos are cached with staleTime/gcTime
2. **Query Invalidation**: Mutations invalidate relevant queries for fresh data
3. **UI State Management**: Theme, sidebar, filters managed by SignalStore
4. **Computed Values**: Derived state using Angular signals
5. **Loading States**: Proper handling of pending/error/success states
6. **Reactive Updates**: All state changes propagate automatically
7. **Type Safety**: Full TypeScript type checking throughout

## 🚀 Running the Application

```bash
npm install
npm start
```

Visit `http://localhost:4200/dashboard` to see the application.

## 📚 Best Practices Implemented

1. **Separation of Concerns**: Server state vs. client state clearly separated
2. **Centralized Query Keys**: Single source of truth for cache keys
3. **Type Safety**: Full TypeScript types for models and state
4. **Immutable Updates**: Using patchState for state modifications
5. **Cache Optimization**: Proper staleTime and gcTime configuration
6. **Query Invalidation**: Keeping cache fresh after mutations
7. **Reactive Architecture**: Using signals for automatic updates
8. **Standalone Components**: Modern Angular architecture

## 🔍 Cache Inspection

The dashboard displays real-time cache information:
- Query status (pending/success/error)
- Is fetching (background updates)
- Is stale (needs refetch)
- Last update timestamp

This transparency helps understand TanStack Query's caching behavior.

## 📖 References

- [TanStack Query Angular Docs](https://tanstack.com/query/latest/docs/angular/overview)
- [NgRx SignalStore Docs](https://ngrx.io/guide/signals)
- [Angular Signals](https://angular.dev/guide/signals)
