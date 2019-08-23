import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
		url: "localhost:3000",
		items: [
			{
				name: "",
				children: [],
				path: decodeURIComponent(document.location.pathname),
				file: "",
				id: -1,
			},
		],
  },
  mutations: {
		SET_CHILDREN(state, { items, node }) {
			items.forEach(e => {
				node.children.push(e);
			});
		}
  },
  actions: {
		fetchItems({state, commit}, item) {

      console.log(item.id);
      console.log(state.url + item.path);

      return (
        fetch('http://' + state.url + item.path + item.name + '/')
          .then(res => res.json())
          .then(arr => {
						commit('SET_CHILDREN', { items: arr, node: item });
          })
      );
    }
  }
})
