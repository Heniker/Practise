<template>
  <div id="app">
    <v-app id="inspire">
      <v-treeview
        activatable
        item-key="id"
        open-on-click
        transition
        :items="items"
        :load-children="fetchItems"
        dense
        rounded
      >
        <template v-slot:prepend="{ item, open }">
          <v-icon v-if="!item.file">{{ open ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
          <v-icon v-else>{{ files[item.file] }}</v-icon>
        </template>
      </v-treeview>
    </v-app>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: this.$store.state.url,
      files: {
        html: "mdi-language-html5",
        js: "mdi-nodejs",
        json: "mdi-json",
        md: "mdi-markdown",
        pdf: "mdi-file-pdf",
        png: "mdi-file-image",
        txt: "mdi-file-document-outline",
        xls: "mdi-file-excel"
      }
    };
  },

  computed: {
    items() {
      return this.$store.state.items;
      return [
        {
          name: "",
          children: this.folders,
          path: decodeURIComponent(document.location.pathname),
          file: "",
          id: -1
        }
      ];
    }
  },

  methods: {
    fetchItems(item) {
      return this.$store.dispatch("fetchItems", item);
    }
  }
};
</script>
