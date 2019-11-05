// Coordinate Suspending components with SuspenseList

// http://localhost:3000/isolated/exercises-final/07

import React from 'react'
import fetchPokemon, {getImageUrlForPokemon} from '../fetch-pokemon'
import {ErrorBoundary} from '../utils'

// preloads our fallback image
document.createElement('img').src = '/img/pokemon/fallback-pokemon.jpg'

// By default, all fetches are mocked so we can control the time easily.
// You can adjust the fetch time with this:
// window.FETCH_TIME = 3000
// If you want to make an actual network call for the pokemon
// then uncomment the following line
// window.fetch.restoreOriginalFetch()
// Note that by doing this, the FETCH_TIME will no longer be considered
// and if you want to slow things down you should use the Network tab
// in your developer tools to throttle your network to something like "Slow 3G"

function createResource(asyncFn) {
  let status = 'pending'
  let result
  let promise = asyncFn().then(
    r => {
      status = 'success'
      result = r
    },
    e => {
      status = 'error'
      result = e
    },
  )
  return {
    read() {
      if (status === 'pending') throw promise
      if (status === 'error') throw result
      if (status === 'success') return result
      throw new Error('This should be impossible')
    },
  }
}

function createPokemonResource(pokemonName, delay) {
  const lowerName = pokemonName
  const data = createResource(() => fetchPokemon(lowerName, delay))
  const image = createResource(
    () =>
      new Promise(resolve => {
        const img = new Image()
        const src = getImageUrlForPokemon(lowerName)
        img.src = src
        img.onload = () => resolve(src)
      }),
  )
  return {data, image}
}

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.data.read()
  return (
    <div className="pokemon-info__flex-container">
      <div>
        <div className="pokemon-info__img-wrapper">
          <img src={pokemonResource.image.read()} alt={pokemon.name} />
        </div>
        <section>
          <h2>
            {pokemon.name}
            <sup>{pokemon.number}</sup>
          </h2>
        </section>
        <section>
          <ul>
            {pokemon.attacks.special.map(attack => (
              <li key={attack.name}>
                <label>{attack.name}</label>:{' '}
                <span>
                  {attack.damage} <small>({attack.type})</small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="pokemon-info__notes-container">
        <h3>Notes:</h3>
        <textarea placeholder="Take notes here..." />
      </section>
      <small className="pokemon-info__fetch-time">{pokemon.fetchedAt}</small>
    </div>
  )
}

// Try this:
// const favoritePokemon = [
//   {name: 'charizard', delay: 1000},
//   {name: 'bulbasaur', delay: 500},
// ]
// Then switch between revealOrder of "together" "forwards" and "backwards"
//
// The try this:
// const favoritePokemon = [
//   {name: 'charizard', delay: 1000},
//   {name: 'bulbasaur', delay: 500},
//   {name: 'ditto', delay: 2000},
// ]
// and do the same there. Also try without revealOrder (default behavior as if you have no SuspenseList).

// there's also a prop called "tail" which can be either "collapsed" or "hidden"
// play around with that too.

const favoritePokemon = [
  {name: 'charizard', delay: 1000},
  {name: 'bulbasaur', delay: 500},
  {name: 'ditto', delay: 2000},
  {name: 'mewtwo', delay: 500},
  {name: 'mew', delay: 2500},
  {name: 'pikachu', delay: 400},
  // if you are using the graphql endpoint, then try these:
  // {name: 'eevee', delay: 200},
  // {name: 'snorlax', delay: 700},
  // {name: 'charmander', delay: 400},
  // {name: 'gengar', delay: 100},
  // {name: 'squirtle', delay: 1500},
  // {name: 'dragonite', delay: 4500},
  // {name: 'jigglypuff', delay: 6000},
  // {name: 'gyarados', delay: 500},
  // {name: 'raichu', delay: 500},
  // {name: 'psyduck', delay: 500},
  // {name: 'vulpix', delay: 500},
  // {name: 'ninetales', delay: 500},
]

function PlaceholderPokemon({name}) {
  return (
    <div className="pokemon-info__flex-container">
      <div className="pokemon-info__img-wrapper">
        <img src="/img/pokemon/fallback-pokemon.jpg" alt={name} />
      </div>
      <section>
        <h2>
          {name}
          <sup>XXX</sup>
        </h2>
      </section>
      <section>
        <ul>
          <li>
            <label>Loading Attack</label>:{' '}
            <span>
              XX <small>(Type)</small>
            </span>
          </li>
          <li>
            <label>Loading Attack</label>:{' '}
            <span>
              XX <small>(Type)</small>
            </span>
          </li>
        </ul>
      </section>
      <section className="pokemon-info__notes-container">
        <h3>Notes:</h3>
        <textarea disabled placeholder="Loading notes..." />
      </section>
      <small className="pokemon-info__fetch-time">loading...</small>
    </div>
  )
}

const SUSPENSE_CONFIG = {timeoutMs: 1000}

function App() {
  const [
    favoritePokemonResources,
    setFavoritePokemonResources,
  ] = React.useState([])
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)

  function handleGoClick() {
    startTransition(() => {
      const newResources = favoritePokemon.map(({name, delay}) => ({
        name,
        resource: createPokemonResource(name, delay),
      }))

      setFavoritePokemonResources(newResources)
    })
  }

  return (
    <div>
      <div>
        <button onClick={handleGoClick}>Go!</button>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <React.SuspenseList revealOrder="forwards">
          {favoritePokemonResources.map(({name, resource}) => (
            <div
              key={name}
              className="pokemon-info"
              style={{margin: 20, height: 'auto'}}
            >
              <ErrorBoundary>
                <React.Suspense fallback={<PlaceholderPokemon name={name} />}>
                  <PokemonInfo pokemonResource={resource} />
                </React.Suspense>
              </ErrorBoundary>
            </div>
          ))}
        </React.SuspenseList>
      </div>
    </div>
  )
}

/*
🦉 Elaboration & Feedback
After the instruction, copy the URL below into your browser and fill out the form:
http://ws.kcd.im/?ws=Concurrent%20React&e=TODO&em=
*/

////////////////////////////////////////////////////////////////////
//                                                                //
//                 Don't make changes below here.                 //
// But do look at it to see how your code is intended to be used. //
//                                                                //
////////////////////////////////////////////////////////////////////

export default App
