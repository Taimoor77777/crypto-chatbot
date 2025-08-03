// // import {
// //   Chart as ChartJS,
// //   LineElement,
// //   PointElement,
// //   CategoryScale,
// //   LinearScale,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";
// // import { Line } from "react-chartjs-2";

// // ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// // export default function CoinChart({ title, data }) {
// //   const chartData = {
// //     labels: data.map((point) => point.date),
// //     datasets: [
// //       {
// //         label: "Price (USD)",
// //         data: data.map((point) => point.price),
// //         fill: false,
// //         borderColor: "#4f46e5",
// //         backgroundColor: "#4f46e5",
// //         tension: 0.2,
// //       },
// //     ],
// //   };

// //   const options = {
// //     responsive: true,
// //     plugins: {
// //       legend: { display: true },
// //       tooltip: { mode: "index", intersect: false },
// //     },
// //     scales: {
// //       x: { display: true, title: { display: true, text: "Date" } },
// //       y: { display: true, title: { display: true, text: "Price (USD)" } },
// //     },
// //   };

// //   return (
// //     <div className="bg-white p-4 rounded-xl shadow-md mb-4">
// //       <h2 className="text-lg font-semibold mb-2">{title}</h2>
// //       <Line data={chartData} options={options} />
// //     </div>
// //   );
// // }

// "use client"

// import { useState } from "react"
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js"
// import { Line } from "react-chartjs-2"

// ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

// export default function CoinChart({ title, data, coin }) {
//   const [selectedPeriod, setSelectedPeriod] = useState("7d")
//   const [chartData, setChartData] = useState(data)
//   const [isLoading, setIsLoading] = useState(false)
//   const [hoveredPrice, setHoveredPrice] = useState(null)
//   const [hoveredDate, setHoveredDate] = useState(null)

//   const periods = [
//     { label: "7D", value: "7d", days: 7 },
//     { label: "1M", value: "1m", days: 30 },
//     { label: "3M", value: "3m", days: 90 },
//     { label: "1Y", value: "1y", days: 365 },
//     { label: "ALL", value: "all", days: 1825 }, // ~5 years
//   ]

//   const fetchChartData = async (period) => {
//     setIsLoading(true)
//     try {
//       const periodData = periods.find((p) => p.value === period)
//       const response = await fetch("http://localhost:5000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: `${coin} chart for ${periodData.days} days` }),
//       })
//       const result = await response.json()
//       if (result.type === "chart" && result.data) {
//         setChartData(result.data)
//       }
//     } catch (error) {
//       console.error("Error fetching chart data:", error)
//     }
//     setIsLoading(false)
//   }

//   const handlePeriodChange = (period) => {
//     setSelectedPeriod(period)
//     fetchChartData(period)
//   }

//   // Calculate price change
//   const currentPrice = chartData[chartData.length - 1]?.price || 0
//   const previousPrice = chartData[0]?.price || 0
//   const priceChange = currentPrice - previousPrice
//   const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100).toFixed(2) : 0
//   const isPositive = priceChange >= 0

//   // Format price for display
//   const formatPrice = (price) => {
//     if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`
//     if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`
//     return `$${price.toLocaleString()}`
//   }

//   // Chart configuration
//   const chartConfig = {
//     labels: chartData.map((point) => {
//       const date = new Date(point.date)
//       if (selectedPeriod === "7d") return date.toLocaleDateString("en-US", { weekday: "short" })
//       if (selectedPeriod === "1m") return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
//       return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
//     }),
//     datasets: [
//       {
//         label: "Price (USD)",
//         data: chartData.map((point) => point.price),
//         fill: true,
//         borderColor: isPositive ? "#10b981" : "#ef4444",
//         backgroundColor: isPositive
//           ? "linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)"
//           : "linear-gradient(180deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)",
//         borderWidth: 3,
//         pointRadius: 0,
//         pointHoverRadius: 8,
//         pointHoverBackgroundColor: isPositive ? "#10b981" : "#ef4444",
//         pointHoverBorderColor: "#ffffff",
//         pointHoverBorderWidth: 3,
//         tension: 0.4,
//       },
//     ],
//   }

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: {
//       intersect: false,
//       mode: "index",
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },
//       tooltip: {
//         enabled: false,
//         external: (context) => {
//           const { chart, tooltip } = context
//           if (tooltip.opacity === 0) {
//             setHoveredPrice(null)
//             setHoveredDate(null)
//             return
//           }

//           const dataPoints = tooltip.dataPoints
//           if (dataPoints && dataPoints.length > 0) {
//             const dataIndex = dataPoints[0].dataIndex
//             const price = chartData[dataIndex]?.price
//             const date = chartData[dataIndex]?.date
//             setHoveredPrice(price)
//             setHoveredDate(date)
//           }
//         },
//       },
//     },
//     scales: {
//       x: {
//         display: true,
//         grid: {
//           display: false,
//         },
//         ticks: {
//           color: "#6b7280",
//           font: {
//             size: 12,
//           },
//         },
//       },
//       y: {
//         display: true,
//         position: "right",
//         grid: {
//           color: "rgba(107, 114, 128, 0.1)",
//         },
//         ticks: {
//           color: "#6b7280",
//           font: {
//             size: 12,
//           },
//           callback: (value) => formatPrice(value),
//         },
//       },
//     },
//     onHover: (event, activeElements) => {
//       if (activeElements.length > 0) {
//         const dataIndex = activeElements[0].index
//         const price = chartData[dataIndex]?.price
//         const date = chartData[dataIndex]?.date
//         setHoveredPrice(price)
//         setHoveredDate(date)
//       } else {
//         setHoveredPrice(null)
//         setHoveredDate(null)
//       }
//     },
//   }

//   return (
//     <div className="chart-container-enhanced">
//       <div className="chart-wrapper-enhanced">
//         {/* Header */}
//         <div className="chart-header-enhanced">
//           <div className="chart-title-section">
//             <h3 className="chart-title-enhanced">{title}</h3>
//             <div className="chart-subtitle">{hoveredDate ? new Date(hoveredDate).toLocaleDateString() : "Latest"}</div>
//           </div>
//           <div className="chart-price-section">
//             <div className="chart-current-price">
//               {hoveredPrice ? formatPrice(hoveredPrice) : formatPrice(currentPrice)}
//             </div>
//             <div className={`chart-price-change ${isPositive ? "positive" : "negative"}`}>
//               {isPositive ? "📈" : "📉"} {isPositive ? "+" : ""}
//               {priceChangePercent}% ({selectedPeriod})
//             </div>
//           </div>
//         </div>

//         {/* Time Period Buttons */}
//         <div className="chart-period-buttons">
//           {periods.map((period) => (
//             <button
//               key={period.value}
//               onClick={() => handlePeriodChange(period.value)}
//               disabled={isLoading}
//               className={`period-button ${selectedPeriod === period.value ? "active" : ""} ${
//                 isLoading ? "loading" : ""
//               }`}
//             >
//               {period.label}
//             </button>
//           ))}
//         </div>

//         {/* Chart */}
//         <div className="chart-canvas-container">
//           {isLoading ? (
//             <div className="chart-loading">
//               <div className="loading-spinner"></div>
//               <p>Loading chart data...</p>
//             </div>
//           ) : (
//             <Line data={chartConfig} options={options} />
//           )}
//         </div>

//         {/* Chart Stats */}
//         <div className="chart-stats">
//           <div className="stat-item">
//             <span className="stat-label">High</span>
//             <span className="stat-value">{formatPrice(Math.max(...chartData.map((p) => p.price)))}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">Low</span>
//             <span className="stat-value">{formatPrice(Math.min(...chartData.map((p) => p.price)))}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">Change</span>
//             <span className={`stat-value ${isPositive ? "positive" : "negative"}`}>
//               {formatPrice(Math.abs(priceChange))}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function CoinChart({ title, data, coin }) {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [chartData, setChartData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredPrice, setHoveredPrice] = useState(null)
  const [hoveredDate, setHoveredDate] = useState(null)

  const periods = [
    { label: "7D", value: "7d", days: 7 },
    { label: "1M", value: "1m", days: 30 },
    { label: "3M", value: "3m", days: 90 },
    { label: "1Y", value: "1y", days: 365 },
    { label: "ALL", value: "all", days: 1825 },
  ]

  const fetchChartData = async (period) => {
    setIsLoading(true)
    try {
      const periodData = periods.find((p) => p.value === period)
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${coin} chart for ${periodData.days} days` }),
      })
      const result = await response.json()
      if (result.type === "chart" && result.data) {
        setChartData(result.data)
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
    }
    setIsLoading(false)
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    fetchChartData(period)
  }

  // Calculate price change
  const currentPrice = chartData[chartData.length - 1]?.price || 0
  const previousPrice = chartData[0]?.price || 0
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100).toFixed(2) : 0
  const isPositive = priceChange >= 0

  // Format price for display
  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`
    return `$${price.toLocaleString()}`
  }

  // Format date labels based on period
  const formatDateLabel = (dateString, index) => {
    const date = new Date(dateString)

    if (selectedPeriod === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    } else if (selectedPeriod === "1m") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else if (selectedPeriod === "3m") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    }
  }

  // Chart configuration with CoinGecko-like styling
  const chartConfig = {
    labels: chartData.map((point, index) => formatDateLabel(point.date, index)),
    datasets: [
      {
        label: "Price (USD)",
        data: chartData.map((point) => point.price),
        fill: true,
        borderColor: isPositive ? "#16a34a" : "#dc2626",
        backgroundColor: isPositive ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isPositive ? "#16a34a" : "#dc2626",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: isPositive ? "#16a34a" : "#dc2626",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const dataIndex = context[0].dataIndex
            const date = new Date(chartData[dataIndex]?.date)
            return date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          },
          label: (context) => {
            return `Price: ${formatPrice(context.parsed.y)}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
            weight: "500",
          },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        display: true,
        position: "right",
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
            weight: "500",
          },
          callback: (value) => formatPrice(value),
          maxTicksLimit: 6,
        },
        border: {
          display: false,
        },
      },
    },
    onHover: (event, activeElements) => {
      if (activeElements.length > 0) {
        const dataIndex = activeElements[0].index
        const price = chartData[dataIndex]?.price
        const date = chartData[dataIndex]?.date
        setHoveredPrice(price)
        setHoveredDate(date)
      } else {
        setHoveredPrice(null)
        setHoveredDate(null)
      }
    },
  }

  return (
    <div className="coingecko-chart-container">
      <div className="coingecko-chart-wrapper">
        {/* Header */}
        <div className="coingecko-chart-header">
          <div className="chart-title-section">
            <h3 className="coingecko-chart-title">{title}</h3>
            <div className="chart-subtitle">
              {hoveredDate
                ? new Date(hoveredDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Latest"}
            </div>
          </div>
          <div className="chart-price-section">
            <div className="coingecko-current-price">
              {hoveredPrice ? formatPrice(hoveredPrice) : formatPrice(currentPrice)}
            </div>
            <div className={`coingecko-price-change ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? "▲" : "▼"} {Math.abs(priceChangePercent)}% ({selectedPeriod})
            </div>
          </div>
        </div>

        {/* Time Period Buttons */}
        <div className="coingecko-period-buttons">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              disabled={isLoading}
              className={`coingecko-period-button ${selectedPeriod === period.value ? "active" : ""} ${
                isLoading ? "loading" : ""
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="coingecko-chart-canvas">
          {isLoading ? (
            <div className="coingecko-chart-loading">
              <div className="coingecko-loading-spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : (
            <Line data={chartConfig} options={options} />
          )}
        </div>

        {/* Chart Stats */}
        <div className="coingecko-chart-stats">
          <div className="coingecko-stat-item">
            <span className="stat-label">24h High</span>
            <span className="stat-value">{formatPrice(Math.max(...chartData.map((p) => p.price)))}</span>
          </div>
          <div className="coingecko-stat-item">
            <span className="stat-label">24h Low</span>
            <span className="stat-value">{formatPrice(Math.min(...chartData.map((p) => p.price)))}</span>
          </div>
          <div className="coingecko-stat-item">
            <span className="stat-label">Change</span>
            <span className={`stat-value ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? "+" : ""}
              {formatPrice(priceChange)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

