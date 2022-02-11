import { Component, VModel, UI } from "../app/ui";

@Component({
  // language=Vue
  template: `
    <v-data-table
      :headers="headers"
      :items="tableData"
      class="elevation-1"
    >
      <template v-slot:items="props">
        <td v-for="(value, key) in props.item" v-if="key !== 'id' && key !== 'type'"> 
          <v-checkbox
            v-if="typeof value === 'boolean'"
            :input-value="value"
            @change="value => onChange(props.item.id, value)"
            primary
            hide-details
          ></v-checkbox>
          <span v-else>{{value}}</span>
        </td>
      </template>
    </v-data-table>
  `
})
export class TableData extends UI {
  @VModel({ type: Array, default: [] }) tableData!: Array<TableDataType>

  private static locale: any = {
    date: "Дата",
    totalAmount: "Сумма",
    quantity: "Количество",
    label: "Назввание",
    comment: "Комменарий",
    period: "Период",
    selected: "Выбор"
  }

  onChange(idx: number, newValue: boolean) {
    this.tableData = this.tableData.map(row =>
      ({ ...row, selected: row.id === idx ? newValue : row.selected }))
  }

  get headers() {
    return [
      ...Object.keys(this.tableData[0])
        .filter(key => key !== 'id' && key !== 'type')
        .map(key =>
          ({ text: TableData.locale[key] || key, value: key })
        ),
    ]
  }
}

