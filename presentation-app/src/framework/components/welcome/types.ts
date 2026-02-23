export type SortMode = 'default' | 'alpha' | 'duration' | 'category';
export type ViewMode = 'grid' | 'list';

export interface WelcomeState {
  search: string;
  selectedTags: string[];
  sort: SortMode;
  view: ViewMode;
  hoveredId: string | null;
  showBreakdown: string | null;
}

export type WelcomeAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_TAG'; payload: string }
  | { type: 'CLEAR_TAGS' }
  | { type: 'SET_SORT'; payload: SortMode }
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'SET_HOVERED'; payload: string | null }
  | { type: 'SHOW_BREAKDOWN'; payload: string | null }
  | { type: 'RESTORE_FROM_URL'; payload: Partial<Pick<WelcomeState, 'search' | 'selectedTags' | 'sort' | 'view'>> };
