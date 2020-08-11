<template>
  <v-app class="app">
    <v-app-bar app class="app-bar"> </v-app-bar>
    <v-main class="main-content">
      <section class="d-flex flex-column justify-space-around max-height">
        <section class="d-flex flex-row justify-center nowrap">
          <div v-for="(item, index) in numbers" :key="index" class="px-5">
            <v-card
              elevation="10"
              class="text-center cool-numbers-wrapper"
              outlined
            >
              <div
                v-for="(number, index) in item"
                :key="number.key"
                class="cool-numbers d-flex align-center justify-center"
              >
                {{ number.value }}
              </div>
            </v-card>
          </div>
        </section>
        <section>
          <v-container>
            <v-row class="mb-3" justify="center" no-gutters>
              <v-col cols="auto">
                <v-btn @click="startGame" :loading="isLoading" x-large
                  >Play</v-btn
                >
              </v-col>
            </v-row>
            <v-row class="mb-3" justify="center" no-gutters>
              <v-col cols="auto">
                <v-btn @click="checkValid" :loading="isLoading" x-large
                  >Check Result</v-btn
                >
              </v-col>
            </v-row>
            <v-row justify="center" no-gutters>
              <v-col cols="2">
                <v-textarea
                  class="mt-7"
                  no-resize
                  v-model="validationText"
                  placeholder="Your result will be here..."
                  rows="1"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </section>
      </section>
    </v-main>
  </v-app>
</template>

<script lang="ts" src="./App.v.ts"></script>

<style>
:root {
  overflow-y: hidden;
}

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

.app-bar input {
  text-align: center;
}

.max-height {
  height: 100%;
}

.cool-numbers-wrapper {
  border: none !important;
  height: 400px;
  width: 400px;
  overflow: hidden;
}

.cool-numbers {
  height: 400px;
  font-size: 200px;
}

.main-content {
  background-color: #333333;
}
</style>
