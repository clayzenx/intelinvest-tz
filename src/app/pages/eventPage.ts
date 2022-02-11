import { Component, UI } from "../app/ui";
import axios from "axios";

@Component({
  // language=Vue
  template: `
    <v-container>
      <v-card>
        <v-card-title><h4>{{ event.label }} {{ $route.params.id }}</h4></v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile v-for="(value, key) in event">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ value }}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-container>
  `,
})
export class EventPage extends UI {
  private event: TableDataType = {};

  async created() {
    this.event = (await axios.get('http://localhost:3004/events')).data[this.$route.params.id]
  }
}
