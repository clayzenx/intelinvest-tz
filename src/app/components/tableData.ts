import { Component, Prop, UI } from "../app/ui";

@Component({
  // language=Vue
  template: `
    <v-data-table
      :headers="headers"
    ></v-data-table>
  `
})
export class TableData extends UI {
  @Prop({ required: true, type: Array, default: [] }) readonly data: Array<TableData>

  private static locale: TableData = {
    date: 'Дата',
    amountPerShare: 'das'
  } 

  get headers() {
    return Object.keys(this.data[0]).map(key => ({ text: TableData.locale[key] || key, value: key }))
  }
}

