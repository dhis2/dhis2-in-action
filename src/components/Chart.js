import React, { useState, useRef, useEffect } from "react";
import { chart } from "highcharts";
import { categories } from "../utils/data";
import "./Chart.css";

const Chart = ({ category, data, show }) => {
  const [instance, setInstance] = useState();
  const container = useRef();

  useEffect(() => {
    setInstance(
      chart("chart", {
        chart: {
          type: "area",
          marginTop: 4,
        },
        title: {
          text: null, // 'Countries using DHIS 2'
        },
        xAxis: {
          tickmarkPlacement: "on",
          title: {
            enabled: false,
          },
        },
        yAxis: {
          title: {
            text: "Countries using DHIS2",
          },
        },
        tooltip: {
          split: true,
        },
        plotOptions: {
          area: {
            stacking: "normal",
            lineColor: "#666666",
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: "#666666",
            },
          },
        },
        series: [],
        legend: {
          enabled: false,
        },
      })
    );
  }, [container]);

  useEffect(() => {
    if ((instance, category, data)) {
      const { series, xAxis, yAxis } = instance;
      const { title, legend } = categories.find((c) => c.id === category);
      const { years, year } = data;

      instance.reflow();

      const yearRange = years.slice(
        years.findIndex((y) => legend.some(({ code }) => year[y][code]))
      );

      while (series.length) {
        series[0].remove();
      }

      xAxis[0].setCategories(yearRange);
      yAxis[0].setTitle({ text: `${title} implementations` });

      legend
        .slice()
        .reverse()
        .forEach(({ code, name, color }) =>
          instance.addSeries({
            name: name,
            data: yearRange.map((y) => year[y][code]),
            color: color,
          })
        );
    }
  }, [instance, category, data]);

  useEffect(() => {
    if (instance && show) {
      instance.reflow();
    }
  }, [instance, show]);

  return (
    <div
      id="chart"
      ref={container}
      className={`Chart Chart-${show ? "show" : "hide"}`}
    ></div>
  );
};

export default Chart;
