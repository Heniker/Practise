new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data() {
    return {
      headers: [
        {
          text: 'ID пользовователя',
          value: 'userId',
        },
        {
          text: 'ID сообщения',
          value: 'id',
        },
        {
          text: 'Название',
          value: 'title',
        },
        {
          text: 'Удалить',
          value: 'delete',
          sortable: false,
        },
        {
          sortable: false,
          text: '',
          value: 'data-table-expand',
        },
      ],
      items: [],
      isLoading: true,
      authToken: null,
      search: '',
    }
  },
  created() {
    this.fetchItems()
  },
  methods: {
    async fetchItems() {
      this.isLoading = true
      // await new Promise(resolve => setTimeout(resolve, 3000))
      this.items = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((it) => it.text().then(JSON.parse))
      this.isLoading = false
    },

    remove(item) {
      this.items.splice(
        this.items.findIndex((it) => it.id === item.id),
        1
      )
    },

    submit() {
      //
    },
  },
})
