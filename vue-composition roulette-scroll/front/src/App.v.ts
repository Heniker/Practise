import { ref, computed, reactive } from '@vue/composition-api'
import * as scrollIntoView from 'scroll-into-view'
import * as gameApi from './api/websocket/game'

const genRandomInt = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getAuth = async () => {
  const value = window.localStorage.getItem('auth')
  if (!value) {
    const auth = await gameApi.getAuth()
    window.localStorage.setItem('auth', '' + auth)
    return auth
  }
  return value
}

export default {
  setup() {
    const { numbers, generateNumbers, startAnimation } = useNumbers()
    const {
      isLoading,
      loadGame,
      validationText,
      validateGame,
    } = useGame()

    return {
      numbers,
      isLoading,
      validationText,
      startGame: async () => {
        const numbers = await loadGame()
        generateNumbers(numbers)
        setTimeout(startAnimation, 300)
      },
      checkValid: async () => {
        const numbers = await validateGame()
        generateNumbers(numbers)
        setTimeout(startAnimation, 300)
      },
    }
  },
}

const useNumbers = () => {
  const numbers = ref<Array<Array<{ value: number; key: number }>>>([
    [{ value: 0, key: 0 }],
    [{ value: 0, key: 1 }],
    [{ value: 0, key: 3 }],
  ])

  const getNumbers = (
    lastValue: number
  ): Array<{ value: number; key: number }> => {
    return [
      ...Array.from(Array(genRandomInt(20, 40))).map((it) => ({
        value: genRandomInt(0, 9),
        key: Math.random(),
      })),

      { value: lastValue, key: Math.random() },
    ]
  }

  const generateNumbers = (lastValues: Array<number>) => {
    numbers.value.forEach((it, index) => {
      const el = it[it.length - 1]
      it.push(el)
      it.push(...getNumbers(lastValues[index]))
    })
  }

  const startAnimation = () => {
    const wrappers = document.querySelectorAll('.cool-numbers-wrapper')

    for (let index = 0; index < wrappers.length; index++) {
      scrollIntoView(wrappers[index].lastElementChild, {
        align: {
          top: 0,
        },
        isScrollable: () => true,
        time: Math.random() * 100,
        ease: (x) =>
          x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
      })
    }
  }

  return { numbers, generateNumbers, startAnimation }
}

const useGame = () => {
  const local = reactive({
    salt: '',
    validity: ''
  })
  const isLoading = ref<boolean>(false)

  const loadGame = async () => {
    const auth = await getAuth()
    isLoading.value = true
    await gameApi.subscribeToGame(auth)
    let numbers: number[]
    ;({ numbers, salt: local.salt, validity: local.validity } = await gameApi.getGameResults())
    isLoading.value = false
    return numbers
  }

  const validateGame = async () => {
    const numbers = await gameApi.retriveGame(
      local.validity,
      local.salt
    )

    return numbers
  }

  const validationText = computed({
    get() {
      return !!(local.validity && local.salt)
        ? `${local.validity} | ${local.salt}`
        : ''
    },

    set(value) {
      const parsed = (value as any).split(' | ')
      if (parsed.length === 2) {
        local.validity = parsed[0]
        local.salt = parsed[1]
      }
    },
  })
  return { isLoading, loadGame, validationText, validateGame }
}
