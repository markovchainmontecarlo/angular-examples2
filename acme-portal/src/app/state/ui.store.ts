import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface UiState {
  selectedUserId: number | null;
  showCompletedTodos: boolean;
  searchTerm: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}

const initialState: UiState = {
  selectedUserId: null,
  showCompletedTodos: true,
  searchTerm: '',
  sidebarCollapsed: false,
  theme: 'light',
};

export const UiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    selectUser(userId: number | null) {
      patchState(store, { selectedUserId: userId });
    },
    toggleCompletedTodos() {
      patchState(store, (state) => ({
        showCompletedTodos: !state.showCompletedTodos,
      }));
    },
    setSearchTerm(searchTerm: string) {
      patchState(store, { searchTerm });
    },
    toggleSidebar() {
      patchState(store, (state) => ({
        sidebarCollapsed: !state.sidebarCollapsed,
      }));
    },
    toggleTheme() {
      patchState(store, (state) => ({
        theme: (state.theme === 'light' ? 'dark' : 'light') as 'light' | 'dark',
      }));
    },
    reset() {
      patchState(store, initialState);
    },
  }))
);
