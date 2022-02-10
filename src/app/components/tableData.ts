import { Component, Prop, UI } from "../app/ui";

@Component({
  // language=Vue
  template: `
    <v-data-table
      :headers="headers"
      :items="items"
      class="elevation-1"
    >
      <template v-slot:items="props">
        <td v-for="prop in props.item">{{ prop }}</td>
        <td> 
          <v-checkbox
            :input-value="props.selected"
            primary
            hide-details
          ></v-checkbox>
        </td> 
      </template>
    </v-data-table>
  `
})
export class TableData extends UI {
  @Prop({ required: true, type: Array, default: [] }) readonly tableData: Array<TableDataType>

  private static locale: any = {
    date: "Дата",
    totalAmount: "Сумма",
    quantity: "Количество",
    label: "Назввание",
    comment: "Комменарий",
    period: "Период"
  }

  get headers() {
    return [
      ...Object.keys(this.tableData[0]).map(key =>
        ({ text: TableData.locale[key] || key, value: key })
      ),
      { text: 'Выбор', value: 'select' }
    ]
  }

  get items() {
    return this.tableData
  }

  get selected() {
    return this.tableData
  }
}

