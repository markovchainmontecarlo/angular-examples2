# Implementation Guide

This document provides a quick reference for the key implementation patterns used in this project.

## 🗂️ Folder Structure

```
src/app/
├── data/                          # Server State (TanStack Query)
│   ├── keys/
│   │   └── query-keys.ts         # Query key factory
│   ├── models/
│   │   ├── user.model.ts         # User interface
│   │   └── todo.model.ts         # Todo interface
│   └── data-access/
│       ├── user-data.service.ts  # User queries & mutations
│       └── todo-data.service.ts  # Todo queries & mutations
├── state/                         # Client State (NgRx SignalStore)
│   └── ui.store.ts               # UI state management
└── ui/                           # Presentation Layer
    └── dashboard.component.ts    # Main dashboard
```

## 📋 Implementation Checklist

### ✅ Step 1: Create Angular Project
```bash
ng new acme-portal --standalone --routing --style=scss
cd acme-portal
npm i @tanstack/angular-query-experimental@^5.85.0 @ngrx/signals
```

### ✅ Step 2: Configure Providers
In `app.config.ts`:
```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTanStackQuery(new QueryClient())
  ]
};
```

### ✅ Step 3: Create Query Keys
In `data/keys/query-keys.ts`:
```typescript
export const queryKeys = {
  users: {
    all: ['users'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  }
};
```

### ✅ Step 4: Create Models
In `data/models/user.model.ts`:
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}
```

### ✅ Step 5: Create Data Access Service
In `data/data-access/user-data.service.ts`:
```typescript
@Injectable({ providedIn: 'root' })
export class UserDataService {
  private http = inject(HttpClient);
  private queryClient = injectQueryClient();

  // Query with staleTime and gcTime
  usersQuery = injectQuery(() => ({
    queryKey: queryKeys.users.all,
    queryFn: async () => lastValueFrom(
      this.http.get<User[]>('https://api.example.com/users')
    ),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 10,     // 10 minutes
  }));

  // Mutation with query invalidation
  createUserMutation = injectMutation(() => ({
    mutationFn: async (user: Omit<User, 'id'>) => lastValueFrom(
      this.http.post<User>('https://api.example.com/users', user)
    ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.all 
      });
    },
  }));
}
```

### ✅ Step 6: Create UI Store
In `state/ui.store.ts`:
```typescript
export interface UiState {
  selectedUserId: number | null;
  theme: 'light' | 'dark';
}

export const UiStore = signalStore(
  { providedIn: 'root' },
  withState<UiState>({
    selectedUserId: null,
    theme: 'light',
  }),
  withMethods((store) => ({
    selectUser(userId: number | null) {
      patchState(store, { selectedUserId: userId });
    },
    toggleTheme() {
      patchState(store, (state) => ({
        theme: (state.theme === 'light' ? 'dark' : 'light') as 'light' | 'dark',
      }));
    },
  }))
);
```

### ✅ Step 7: Create Component
In `ui/dashboard.component.ts`:
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    @if (userDataService.usersQuery.isPending()) {
      <div>Loading...</div>
    } @else if (userDataService.usersQuery.data()) {
      @for (user of userDataService.usersQuery.data(); track user.id) {
        <div (click)="uiStore.selectUser(user.id)">
          {{ user.name }}
        </div>
      }
    }
  `
})
export class DashboardComponent {
  userDataService = inject(UserDataService);
  uiStore = inject(UiStore);
}
```

## 🎯 Key Patterns

### Query Pattern
```typescript
// Read data with caching
queryName = injectQuery(() => ({
  queryKey: ['key'],
  queryFn: async () => { /* fetch */ },
  staleTime: 1000 * 60 * 5,  // Fresh for 5 minutes
  gcTime: 1000 * 60 * 10,     // Keep cache for 10 minutes
}));
```

### Mutation Pattern
```typescript
// Write data with invalidation
mutationName = injectMutation(() => ({
  mutationFn: async (data) => { /* update */ },
  onSuccess: () => {
    this.queryClient.invalidateQueries({ queryKey: ['key'] });
  },
}));
```

### State Pattern
```typescript
// Client state management
export const MyStore = signalStore(
  { providedIn: 'root' },
  withState({ value: 0 }),
  withMethods((store) => ({
    increment() {
      patchState(store, (state) => ({ value: state.value + 1 }));
    },
  }))
);
```

### Computed Pattern
```typescript
// Derived reactive state
filteredItems = computed(() => {
  const items = this.dataService.query.data() || [];
  const filter = this.uiStore.filter();
  return items.filter(item => item.matches(filter));
});
```

## 🔧 Configuration Values

### Recommended Cache Times

**Short-lived data** (frequently changing):
- `staleTime: 1000 * 60` (1 minute)
- `gcTime: 1000 * 60 * 5` (5 minutes)

**Medium-lived data** (occasionally changing):
- `staleTime: 1000 * 60 * 5` (5 minutes)
- `gcTime: 1000 * 60 * 10` (10 minutes)

**Long-lived data** (rarely changing):
- `staleTime: 1000 * 60 * 30` (30 minutes)
- `gcTime: 1000 * 60 * 60` (1 hour)

## 🧪 Testing

### Component with Query
```typescript
TestBed.configureTestingModule({
  imports: [Component],
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTanStackQuery(new QueryClient())
  ]
});
```

### Component with Store
```typescript
TestBed.configureTestingModule({
  imports: [Component],
  providers: [
    // Store is providedIn: 'root' so it's automatically available
  ]
});
```

## 📚 Resources

- **TanStack Query**: https://tanstack.com/query/latest/docs/angular/overview
- **NgRx Signals**: https://ngrx.io/guide/signals
- **Angular Signals**: https://angular.dev/guide/signals
- **Architecture Doc**: See ARCHITECTURE.md for detailed explanations
