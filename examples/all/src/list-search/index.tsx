import * as React from 'react'
import { Observable, Subscription } from 'rxjs'
import { Atom, F, bind } from '@grammarly/focal'

const defaultSearchList = Object.keys(window)

function getRandomSearchList() {
  const size = 30
  const start = Math.round(Math.random() * (defaultSearchList.length - size))
  return defaultSearchList.slice(start, start + size)
}

interface AppState {
  searchString: string,
  searchList: string[],
  timer: number
}

namespace AppState {
  export const defaultState: AppState = {
    searchString: '',
    searchList: getRandomSearchList(),
    timer: 0
  }
}

class App extends  React.Component<{ state: Atom<AppState> }, {}> {
  private _subscription: Subscription

  componentDidMount() {
    const { state } = this.props
    const timer = state.lens(x => x.timer)

    this._subscription = Observable
      .interval(1000)
      .subscribe(_ => {
        state.lens(x => x.timer).modify(x => x === 0 ? 5 : x - 1)

        if (timer.get() === 5)
          state.lens(x => x.searchList).set(getRandomSearchList())
      })
  }

  componentWillUnmount() {
    this._subscription.unsubscribe()
  }

  render() {
    const { state } = this.props
    const search = state.lens(x => x.searchString)

    return (
      <div>
        <F.input {...bind({ value: search })} />
        <F.div>Timer: {state.view(x => x.timer)}</F.div>
        <F.div>
          {
            Atom.combine(search, state.lens(x => x.searchList), (searchValue, list) => (
              <div>
                {
                  list
                    .filter(x => x.toLowerCase().includes(searchValue.toLowerCase()))
                    .map((x, i) => <li key={x + i}>{x}</li>)
                }
              </div>
            ))
          }
        </F.div>
      </div>
    )
  }
}

export default {
  Component: App,
  defaultState: AppState.defaultState
}
