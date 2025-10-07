# angular-examples2

Angular examples demonstrating modern state management patterns.

## Projects

### Acme Portal

A comprehensive example demonstrating the integration of **TanStack Query** for server-state caching and **NgRx SignalStore** for UI/client state management.

**Key Features:**
- ✅ TanStack Query for server state with staleTime/gcTime configuration
- ✅ NgRx SignalStore for client-side UI state
- ✅ Proper separation of concerns: data access, state, and UI layers
- ✅ Query keys factory pattern for cache management
- ✅ Mutations with automatic query invalidation
- ✅ Reactive computed values using Angular signals
- ✅ Standalone components architecture

**Structure:**
```
acme-portal/
└── src/app/
    ├── data/           # Server state (TanStack Query)
    │   ├── keys/       # Query key definitions
    │   ├── models/     # Data models
    │   └── data-access/ # Services with queries & mutations
    ├── state/          # Client state (NgRx SignalStore)
    └── ui/             # Components
```

**Getting Started:**
```bash
cd acme-portal
npm install
npm start
```

See [acme-portal/ARCHITECTURE.md](./acme-portal/ARCHITECTURE.md) for detailed documentation.

## Technologies

- Angular 19+ (Standalone Components)
- TanStack Query (Angular Experimental) v5.85+
- NgRx Signals
- TypeScript
- SCSS