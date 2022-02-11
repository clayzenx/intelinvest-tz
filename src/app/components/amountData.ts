import { Component, Prop, UI } from "../app/ui";

@Component({
  // language=Vue
  template: `
    <v-card>
      <v-card-title><h4>Сумма по категориям</h4></v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <div v-if="amountByCategory">
          <v-list-tile v-for="(value, key) in amountByCategory">
            <v-list-tile-content>{{key}}</v-list-tile-content>
            <v-list-tile-content class="align-end">{{value}}</v-list-tile-content>
          </v-list-tile>
        </div>
        <v-list-tile v-else>
          <v-list-tile-content>Не выбрана не одна категория</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  `
})
export class AmountData extends UI {
  @Prop({ required: true, type: Array, default: [] }) readonly tableData: Array<TableDataType>

  get amountByCategory() {
    return this.tableData
      .filter(({ selected }) => selected)
      .reduce((categories: any, { type, totalAmount }) => {
        if (!categories[type]) categories[type] = 0
        categories[type] += parseFloat(totalAmount.split(' ')[1])
        return categories
      }, {})
  }
}

