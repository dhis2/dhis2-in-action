import React, { useState, useRef, useEffect } from "react";
import { chart } from "highcharts";
import { categories } from "../utils/data";
import "./Chart.css";

const Chart = ({ category, data }) => {
  const [instance, setInstance] = useState();
  const container = useRef();

  useEffect(() => {
    setInstance(
      chart("chart", {
        chart: {
          type: "area"
        },
        title: {
          text: null // 'Countries using DHIS 2'
        },
        xAxis: {
          categories: [
            "2006",
            "2007",
            "2008",
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014",
            "2015",
            "2016",
            "2017",
            "2018",
            "2019",
            "2020"
          ],
          tickmarkPlacement: "on",
          title: {
            enabled: false
          }
        },
        yAxis: {
          title: {
            text: "Countries using DHIS2"
          }
        },
        tooltip: {
          split: true
        },
        plotOptions: {
          area: {
            stacking: "normal",
            lineColor: "#666666",
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: "#666666"
            }
          }
        },
        series: [],
        legend: {
          enabled: false
        }
      })
    );
  }, [container]);

  useEffect(() => {
    if ((instance, category, data)) {
      const { series, yAxis } = instance;
      const { title, legend } = categories.find(c => c.id === category);
      const { years } = data;

      if (series.length) {
        series[0].remove();
        series.forEach(s => s.remove());
      }

      yAxis[0].setTitle({ text: `${title} implementations` });

      legend
        .slice()
        .reverse()
        .forEach(({ code, name, color }) => {
          instance.addSeries({
            name: name,
            data: years.map(y => data.year[y][code]),
            color: color
          });
        });
    }
  }, [instance, category, data]);

  return <div id="chart" ref={container} className="Chart"></div>;
};

export default Chart;
