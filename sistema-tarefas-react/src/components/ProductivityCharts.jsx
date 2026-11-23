import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import "../styles/productivity-charts.css";

function ProductivityCharts({ tarefas }) {
  const concluidas = tarefas.filter(
    tarefa => tarefa.concluida
  ).length;
  console.log("DADOS RECEBIDOS PELO GRÁFICO:", tarefas);

  const pendentes = tarefas.length - concluidas;

  const percentual = tarefas.length > 0
    ? Math.round((concluidas / tarefas.length) * 100)
    : 0;

  const dadosPizza = [
    { name: "Concluídas", value: concluidas },
    { name: "Pendentes", value: pendentes }
  ];

  const dadosBarras = [
    { name: "Concluídas", quantidade: concluidas },
    { name: "Pendentes", quantidade: pendentes }
  ];

  const cores = ["#22c55e", "#f59e0b"];

  return (
    <section className="charts-section">

      <div className="charts-header">
        <div>
          <span>DESEMPENHO</span>
          <h2>Produtividade geral</h2>
          <p>Acompanhe o andamento das suas atividades.</p>
        </div>

        <div className="productivity-percentage">
          <strong>{percentual}%</strong>
          <span>Concluído</span>
        </div>
      </div>

      <div className="charts-grid">

        <div className="chart-card">
          <h3>Distribuição de tarefas</h3>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={cores[index]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#151e2e",
                    border: "1px solid #29364b",
                    borderRadius: "10px",
                    color: "#fff"
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Resumo de atividades</h3>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarras}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#29364b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                />

                <YAxis
                  stroke="#94a3b8"
                  allowDecimals={false}
                  fontSize={12}
                />

                <Tooltip
                  contentStyle={{
                    background: "#151e2e",
                    border: "1px solid #29364b",
                    borderRadius: "10px",
                    color: "#fff"
                  }}
                />

                <Bar
                  dataKey="quantidade"
                  fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductivityCharts;