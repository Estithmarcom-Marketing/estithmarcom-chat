export type ChatScreen =
  | 'welcome'
  | 'platforms'
  | 'services'
  | 'service-detail'

export interface NavigationState {
  screen: ChatScreen
  categoryId?: string
  platformId?: string
  serviceId?: string
}

export const initialNavigationState: NavigationState = {
  screen: 'welcome',
}

export type NavigationAction =
  | {
      type: 'SELECT_CATEGORY'
      categoryId: string
    }
  | {
      type: 'SELECT_PLATFORM'
      platformId: string
    }
  | {
      type: 'SELECT_SERVICE'
      serviceId: string
    }
  | {
      type: 'BACK'
    }
  | {
      type: 'RESET'
    }

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return {
        screen: 'platforms',
        categoryId: action.categoryId,
      }

    case 'SELECT_PLATFORM':
      return {
        ...state,
        screen: 'services',
        platformId: action.platformId,
        serviceId: undefined,
      }

    case 'SELECT_SERVICE':
      return {
        ...state,
        screen: 'service-detail',
        serviceId: action.serviceId,
      }

    case 'BACK':
      if (state.screen === 'service-detail') {
        return {
          ...state,
          screen: 'services',
          serviceId: undefined,
        }
      }

      if (state.screen === 'services') {
        return {
          screen: 'platforms',
          categoryId: state.categoryId,
        }
      }

      if (state.screen === 'platforms') {
        return initialNavigationState
      }

      return state

    case 'RESET':
      return initialNavigationState

    default:
      return state
  }
}
