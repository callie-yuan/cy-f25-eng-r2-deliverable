/* eslint-disable */
"use client";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { csv } from "d3-fetch";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// TODO: Write this interface
interface AnimalDatum {
  name: string;
  speed: number;
  diet: string;
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // adding state and listener for selected animals from the multiselect
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);

  // listen for custom event from multiselect component
  useEffect(() => {
    const handleSelectionChange = (e: CustomEvent) => {
      const value = (e as CustomEvent).detail as string[];
      setSelectedAnimals(value);
    };
    window.addEventListener("animalSelectionChange", handleSelectionChange as EventListener);
    return () => {
      window.removeEventListener("animalSelectionChange", handleSelectionChange as EventListener);
    };
  }, []);

  // TODO: Load CSV data
  useEffect(() => {
    csv("/sample_animals.csv")
      .then((rows) => {
        // CSV headers in the file are like "Animal", "Average Speed (km/h)", "Diet"
        const data: AnimalDatum[] = rows.map((row: any) => {
          const name = String(row["Animal"] ?? row.name ?? "");
          const speed = Number(row["Average Speed (km/h)"] ?? row.speed ?? 0);
          const diet = String(row["Diet"] ?? row.diet ?? "");
          return { name, speed, diet } as AnimalDatum;
        });
        console.log("parsed animal data sample:", data.slice(0, 5));
        setAnimalData(data);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
      });
    console.log("Implement CSV loading!");
  }, []);

  // filter the animal data based on selected animals from the multiselect
  const filteredData =
    selectedAnimals.length === 0 ? [] : animalData.filter((data) => selectedAnimals.includes(data.name));

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (filteredData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!).append<SVGSVGElement>("svg").attr("width", width).attr("height", height);

    // TODO: Implement the rest of the graph
    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis

    // band scale for x-axis (categorical)
    const x = scaleBand()
      .domain(filteredData.map((data) => data.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    // linear scale for y-axis (numerical)
    const y = scaleLinear()
      .domain([0, max(filteredData, (data) => data.speed) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);
    // ordinal scale for bar colors (categorical)
    const color = scaleOrdinal<string, string>()
      .domain(["Carnivore", "Herbivore", "Omnivore"])
      .range(["#EA776C", "#6CEA76", "#776CEA"]);

    // draw bars
    svg
      .selectAll("rect")
      .data(filteredData)
      .join("rect")
      .attr("x", (data) => x(data.name)!)
      .attr("y", (data) => y(data.speed))
      .attr("width", x.bandwidth())
      .attr("height", (data) => y(0) - y(data.speed))
      .attr("fill", (data) => color(data.diet));

    // x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 80)
      .attr("text-anchor", "middle")
      .text("Animal");
    // y-axis
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(axisLeft(y).ticks(6).tickSizeOuter(0));
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 70)
      .attr("text-anchor", "middle")
      .text("Average Speed (km/h)");
  }, [animalData, selectedAnimals]);

  // TODO: Return the graph
  return (
    // Placeholder so that this compiles. Delete this below:
    <div>
      <div ref={graphRef} className="h-full w-full"></div>
      {/* legend */}
      <div className="mt-3 flex justify-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="inline-block h-4 w-4" style={{ backgroundColor: "#EA776C" }} />
          <span>Carnivore</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block h-4 w-4" style={{ backgroundColor: "#6CEA76" }} />
          <span>Herbivore</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block h-4 w-4" style={{ backgroundColor: "#776CEA" }} />
          <span>Omnivore</span>
        </div>
      </div>
    </div>
  );
}
