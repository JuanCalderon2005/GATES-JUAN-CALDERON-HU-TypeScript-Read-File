import * as echarts from 'echarts';
export class RenderGrafic {
    countMunicipiosByDepartment(data: any[]): { [department: string]: number } {

        const departmentCount: { [department: string]: number } = {};
    
        data.forEach(item => {
            const departamento = item.DEPARTAMENTO;
            if (departmentCount[departamento]) {
                departmentCount[departamento]++;
            } else {
                departmentCount[departamento] = 1;
            }
        });
    
        return departmentCount;
    }
    separateDepartmentCounts(departmentCount: { [department: string]: number }): { departments: string[], counts: number[] } {
        const departments = Object.keys(departmentCount);
        const counts = Object.values(departmentCount);
        return { departments, counts };
    }

    getOptionchart1(){
        const departments = localStorage.getItem('department') ? JSON.parse(localStorage.getItem('department') || '[]') : [];
        const counts = localStorage.getItem('counts') ? JSON.parse(localStorage.getItem('counts') || '[]') : [];
        
        return {
            xAxis: {
                type: 'category',
                data: departments // Usar el array de departamentos como etiquetas en el eje x
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: counts, // Datos de los conteos de municipios
                    type: 'bar',
                    // Añadir el tooltip a la serie
                    tooltip: {
                        // Configuración del tooltip
                        formatter: function (params: any) {
                            // params.name es el nombre del departamento y params.value es el conteo
                            return `${params.name}<br>Municipios: ${params.value}`;
                        }
                    }
                }
            ],
            // Configuración del tooltip general del gráfico
            tooltip: {
                trigger: 'axis', // Se activará al pasar el mouse sobre el eje
                axisPointer: {
                    type: 'shadow' // Utiliza una sombra en el eje para señalar el área activa
                }
            }
        };
    };
    
    initchart(){
        const chart1 = echarts.init(document.querySelector("#chart") as HTMLElement);
        chart1.setOption(this.getOptionchart1());
    };
}
