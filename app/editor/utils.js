import * as d3 from "d3";

export const LABEL_FEATURE = 'FEATURE'
export const LABEL_RULE = 'RULE'
export const LABEL_FACT = 'FACT'
export const LABEL_GAP = 'GAP'
export const LABEL_SWITCH = 'SWITCH'
export const LABEL_DIY = 'DIY'

// 颜色选项
export const colorOptions = [
    { label: LABEL_FEATURE, color: 'rgb(76, 142, 218)', textColor:'white' },
    { label: LABEL_RULE, color: 'rgb(255, 196, 84)' },
    { label: LABEL_FACT, color: 'rgb(141, 204, 147)' },
    // { label: LABEL_RESULT, color: 'rgb(241, 102, 103)' },
    { label: LABEL_GAP, color: 'rgb(241, 102, 103)', textColor:'white' },
    { label: LABEL_SWITCH, color: 'rgb(229,119,18)', textColor:'white' },
    { label: LABEL_DIY, color: 'rgb(254,9,74)', textColor:'white' },
].map(item => ({ ...item, value: item.label }));

export const isNodeType = (type) => {
    return  !colorOptions.find(item => item.label === type)
}

// 节点类型选择选项
export const NodeTypeSelectOptions = colorOptions.filter(item => item.label !== LABEL_FACT);

function removeHighlight(){
    // Remove any existing highlight circles to avoid duplicates
    d3.selectAll('.highlight-circle').remove();
}
// 拖拽功能
export function drag({ simulation, setClickNode, draggedFun, dragEndFun }) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;

        removeHighlight()
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
        if (draggedFun) draggedFun(event, d);
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        if (dragEndFun) dragEndFun(event, d);
        if (setClickNode) setClickNode(d);
        setTimeout(() => hightlightNode(d.id));
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// 链接拖拽功能
const linkDragFun = ({ simulation, setLinks }) => drag({
    simulation,
    draggedFun: (event, d) => {
        if (d?.target?.fake) {
            const { offsetX: x, offsetY: y } = event?.sourceEvent;
            setLinks(prevLinks => prevLinks.map(link =>
                link.target.id === d.target.id ? { ...link, target: { ...link.target, x, y } } : link
            ));
        }
    },
    dragEndFun: (event, d) => {
        const endNodeId = event?.sourceEvent?.srcElement?.__data__?.id;
        if (endNodeId) {
            setLinks(prevLinks => prevLinks.map(link =>
                link.target.id === d.target.id ? { ...link, target: endNodeId } : link
            ));
        }
    }
});

// 绘制D3力导向图
export const drawD3Force = ({ svg, width, height, simulation, dragFun, handleRightClick, nodes, links, setLinks }) => {
    const link = getLinkDraw({ svg, links })
        .call(linkDragFun({ simulation, setLinks }))
        .on('contextmenu', handleRightClick);

    const linkLabels = getLinkText({ svg, links })
        .call(linkDragFun({ simulation, setLinks }));

    const linkOverlay = getEmptyLinkDraw({ svg, links })
        .call(linkDragFun({ simulation, setLinks }))
        .on('contextmenu', handleRightClick);

    const node = getNodeDraw({ svg, nodes })
        .call(dragFun())
        .on('contextmenu', handleRightClick);

    const text = getTextDraw({ svg, nodes })
        .call(dragFun())
        .on('contextmenu', handleRightClick);

    simulation.on("tick", () => {
        ticked({ node, text, link, linkOverlay, linkLabels });
        nodes.forEach(d => {
            d.x = Math.max(0, Math.min(width, d.x));
            d.y = Math.max(0, Math.min(height, d.y));
        });
        node.attr("cx", d => d.x).attr("cy", d => d.y);
        text.attr("x", d => d.x).attr("y", d => d.y);
    });
}

// 获取箭头标记
export const getMarkerDraw = (svg) => svg.append("marker")
    .attr("id", "resolved")
    .attr("markerUnits", "userSpaceOnUse")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 42)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .attr("stroke-width", 1)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr('fill', '#757474');



// 绘制边（Lines）
export const getLinkDraw = ({ svg, links }) => {
    getMarkerDraw(svg);
    return svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .attr("marker-end", "url(#resolved)");
}

// 绘制边上的文本（Edge Labels）
export const getLinkText = ({ svg, links }) => svg.selectAll(".link-text")
    .data(links)
    .enter()
    .append("text")
    .attr("class", "link-text")
    .attr("font-size", "6px")
    .attr("fill", "#555")
    .attr("text-anchor", "middle")
    .text(d => d.label || d.text || 'Has');

// 获取透明宽线
export const getEmptyLinkDraw = ({ svg, links }) => svg.append("g")
    .attr('stroke-width', 10)
    .attr('stroke', 'transparent')
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("marker-end", "url(#resolved)");

// 获取节点颜色
export const getTargetColorByNode = (d) => {
    const target = colorOptions.find(item => d.label === item.label);
    return target?.color || 'rgba(191,157,241,0.99)';
}

// 绘制节点（Circles）
export const getNodeDraw = ({ svg, nodes }) => svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr('fill', getTargetColorByNode)
    .attr("stroke-width", 2)
    .attr('stroke', d => {
        const fillColor = getTargetColorByNode(d);
        return d3.color(fillColor).darker(0.5); // Make the stroke color slightly darker
    })

// 截断文本
export const truncateText = (text, maxWidth) => {
    const el = document.createElement('span');
    el.style.visibility = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.innerText = text;
    document.body.appendChild(el);
    const computedWidth = el.offsetWidth;
    document.body.removeChild(el);

    if (computedWidth > maxWidth) {
        const ratio = maxWidth / computedWidth;
        const truncatedText = text.substring(0, Math.ceil(text.length * ratio));
        return truncatedText + '...';
    }
    return text;
};

// 获取文本绘制
export const getTextDraw = ({ svg, nodes }) => svg.selectAll(".node-text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("font-size", "9px")
    .style('cursor', 'default')
    .attr("fill", "gray")
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em")
    .text(d => d?.properties?.name ? truncateText(d?.properties?.name, 28) : '')
    .style('fill', d => {
        const target = colorOptions.find(item => d.label === item.label);
        return target?.textColor || 'black';
    });

// tick函数
export function ticked({ link, text, node, linkOverlay, linkLabels }) {
    if (node) {
        node.attr("cx", d => d.x || 0).attr("cy", d => d.y || 0);
    }

    if (text) {
        text.attr('x', d => d.x || 0).attr('y', d => d.y || 0);
    }

    if (link) {
        link.attr("x1", d => d.source.x || 0)
            .attr("y1", d => d.source.y || 0)
            .attr("x2", d => d.target.x || 0)
            .attr("y2", d => d.target.y || 0);
    }

    if (linkOverlay) {
        linkOverlay.attr("x1", d => d.source.x || 0)
            .attr("y1", d => d.source.y || 0)
            .attr("x2", d => d.target.x || 0)
            .attr("y2", d => d.target.y || 0);
    }
    if (linkLabels) {
        linkLabels.attr("x", d => ((d.source?.x || 0) + (d.target?.x || 0)) / 2)
            .attr("y", d => ((d.source?.y || 0) + (d.target?.y || 0)) / 2);
    }
}

// 处理右键菜单
export const handleContextMenu = (event) => {
    event?.preventDefault();
    event?.stopPropagation()
    const mouse = d3.pointer(event, event?.currentTarget);

    const isNodeClicked = isNodeClickedAt(mouse);
    const isLinkClicked = isLinkClickedAt(mouse);

    let type = 'context';
    if (isNodeClicked) {
        type = 'node';
    } else if (isLinkClicked) {
        type = 'link';
    } else if (event.target.nodeName === 'line') {
        type = 'link';
    }

    return {
        type,
        x: event?.clientX,
        y: event?.clientY
    };
};

// 判断是否点击了节点
export const isNodeClickedAt = (mouse) => {
    const nodes = d3.selectAll("circle");
    for (let i = 0; i < nodes.size(); i++) {
        const node = nodes.nodes()[i];
        const nodeX = parseFloat(node.getAttribute('cx'));
        const nodeY = parseFloat(node.getAttribute('cy'));
        const r = parseFloat(node.getAttribute('r'));

        if (Math.sqrt(Math.pow(mouse[0] - nodeX, 2) + Math.pow(mouse[1] - nodeY, 2)) <= r) {
            return true;
        }
    }
    return false;
};

// 判断是否点击了��接
export const isLinkClickedAt = (mouse) => {
    const links = d3.selectAll('line');
    for (let i = 0; i < links.size(); i++) {
        const link = links.nodes()[i];
        const x1 = parseFloat(link.getAttribute('x1'));
        const y1 = parseFloat(link.getAttribute('y1'));
        const x2 = parseFloat(link.getAttribute('x2'));
        const y2 = parseFloat(link.getAttribute('y2'));

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = ((mouse[0] - x1) * dx + (mouse[1] - y1) * dy) / (dist * dist);
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        if (t >= 0 && t <= 1 && Math.sqrt(Math.pow(mouse[0] - projX, 2) + Math.pow(mouse[1] - projY, 2)) <= 5) {
            return true;
        }
    }
    return false;
};

// 高亮节点
export const hightlightNode = (id) => {
    fillDefaultAllNode();

    removeHighlight()

    const node = d3.selectAll('circle').filter((d, i, nodes) => nodes[i].__data__.id === id);

    // Append a new circle with a larger radius and different stroke color
    node.each(function(d) {
        d3.select(this.parentNode).append('circle')
            .attr('class', 'highlight-circle')
            .attr('r', parseFloat(d3.select(this).attr('r')) + 4) // Increase radius
            .attr('cx', d.x || 0)
            .attr('cy', d.y || 0)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(173, 216, 230, 0.5)') // Semi-transparent light blue
            .attr('stroke-width', 5);
    });
}

// 恢复所有节点默认样式
const fillDefaultAllNode = () => {
    d3.selectAll('circle').attr('stroke', d => {
        const fillColor = getTargetColorByNode(d);
        return d3.color(fillColor).darker(0.5); // Make the stroke color slightly darker
    });
}

// 清空所有内容
export const clearAll = ({ svgRef }) => {
    d3.select(svgRef.current).selectAll('*').remove();
}

export const addResetFunInButton=({fun})=>{
    if (document.getElementById('reset-button')){
        // Handle reset zoom button click
        document.getElementById('reset-button').addEventListener('click', fun);
    }
}

export const removeResetFunInButton=({fun})=>{
    if (document.getElementById('reset-button')){
        // Handle reset zoom button click
        document.getElementById('reset-button').addEventListener('click', fun);
    }
}
