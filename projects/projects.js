import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects (${projects.length})`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // newArcs.forEach((arc, idx) => {
    // d3.select('#projects-pie-plot')
    //     .append('path')
    //     .attr('d', arc)
    //     .attr('fill', colors(idx));
    // });

    let legend = d3.select('.legend');

    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();
    newArcs.forEach((arc, idx) => {
        // d3.select('#projects-pie-plot')
        // .append('path')
        // .attr('d', arc)
        // .attr('fill', colors(idx));

        svg
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .on('click', () => {
        // What should we do? (Keep scrolling to find out!)
            selectedIndex = selectedIndex === idx ? -1 : idx;
            svg
            .selectAll('path')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected ' : ''
            ));

        legend
        .selectAll('li')
        .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected legend-item' : 'legend-item'
            ));
        
        if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
        } else {
        // TODO: filter projects and project them onto webpage
        // Hint: `.label` might be useful
            let filteredProjects = projectsGiven.filter((project) => {
                return project.year === newData[idx].label;
            });
            renderProjects(filteredProjects, projectsContainer, 'h2');
        }
        });
    });

    

    newData.forEach((d, idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`)
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

    // re-apply selected/dimmed classes after re-render
    svg.selectAll('path').attr('class', (_, i) =>
        i === selectedIndex ? 'selected' : (selectedIndex === -1 ? '' : 'dimmed')
    );
    legend.selectAll('li').attr('class', (_, i) =>
        i === selectedIndex ? 'selected legend-item' : (selectedIndex === -1 ? 'legend-item' : 'dimmed legend-item')
    );

}

renderPieChart(projects);
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
//   let filteredProjects = setQuery(event.target.value);
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // re-render legends and pie chart when event triggers
  let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();
        d3.select('.legend').selectAll('li').remove();

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  if (selectedIndex !== -1) {
        let rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
        let data = rolledData.map(([year, count]) => ({ value: count, label: year }));
        let yearFiltered = filteredProjects.filter(p => p.year === data[selectedIndex]?.label);
        renderProjects(yearFiltered, projectsContainer, 'h2');
    }

});




