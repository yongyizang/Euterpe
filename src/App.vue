<template>
  <div id="app">
    <div ref="LoadingScreen" id="LoadingScreen">
      <div class="center">
        <p ref="agentStatus" class="loadingStatus">
          Loading Static Files, Please wait...
        </p>
        <div class="loader">
          <div class="loaderBar"></div>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>
<script>
import './css/app.css';
export default {
    watch: {
        $route() {
            this.$nextTick(this.routeLoaded);
        },
    },
    data() {
        return {};
    },
    methods: {
        routeLoaded() {
            this.$refs.LoadingScreen.style.display = 'none';
        },
    },
    mounted() {
        /* The route will not be ready in the mounted hook if it's component is async
    so we use $router.onReady to make sure it is.
    it will fire right away if the router was already loaded, so catches all the cases.
    Just understand that the watcher will also trigger in the case of an async component on mount
    because the $route will change and the function will be called twice in this case,
    it can easily be worked around with a local variable if necessary
    */
        this.$router.onReady(() => this.routeLoaded());
    },
};
</script>
