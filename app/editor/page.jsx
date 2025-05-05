"use strict";
"use client"

import {useEffect, useMemo, useRef, useState} from 'react';
import * as d3 from 'd3';
import {
    addResetFunInButton,
    drag,
    handleContextMenu,
    hightlightNode, LABEL_RULE, removeResetFunInButton,
} from "./utils.js";
import MenuPopover from "./components/MenuPopover/index.jsx";
import AddNodeModal from "./components/AddNodeModal/index.jsx";
import NodeDetailPanel from "./components/NodeDetailPanel/index.jsx";
import {clearAll, drawD3Force} from "./utils.js";
import {
    addLinkWidthStartEndNode, addNodeByXYPosition,
    clearNodesForce,
    deleteLinkByLink,
    deleteNodeAndLinksByNodeId,
    handleRuleTypeAdd, updateNodesByNode, updateRuleNode
} from "./service.js";
import { useSearchParams } from "next/navigation";

import {queryGraphNodeDetail} from "@/api/index.js";
import {Button} from "@/components/ui/button";

import BaseLoadingSkeleton from "@/components/BaseLoadingSkeleton.jsx";
import DraftHandleButton from "@/app/editor/components/DraftHandleButton";

const ForceGraph = () => {
    const searchParams = useSearchParams()
    const graphId = searchParams.get('id');
    const isEditor = searchParams.get('read') !== '1';
    const readOnly = !isEditor

    const [loading, setLoading] = useState(false)
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);


    const svgRef = useRef(null);
    const containerRef = useRef(null)
    const [selectedNode, setSelectedNode] = useState(null)
    const [selectedLink, setSelectedLink] = useState(null);
    const [type, setType] = useState('show')

    const [clickNode, setClickNode] = useState(null)

    const [zoomValue, setZoomValue] = useState(1); // State to hold the zoom value

    const [nodeLabel, setNodeLabel] = useState('')
    const queryData = () => {
        if (graphId) {
            setLoading(true)
            queryGraphNodeDetail({id: graphId}).then(res => {
                if (res.draft) {
                    const obj = JSON.parse(res.draft)
                    setLinks(obj?.edges || [])
                    setNodes(obj?.nodes || [])
                }
                setNodeLabel(res.label)
            }).finally(() => setLoading(false))
        }
    }

    useEffect(() => {
        queryData()
    }, [])


    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        clearAll({svgRef})

        const width = svgRef.current.scrollWidth
        const height = svgRef.current.scrollHeight

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2))

        const dragFun = () => {
            return drag({
                simulation,
                setClickNode: (val) => {
                    setClickNode(val)
                    clearNodesForce({setNodes})
                    setPopoverVisible(false)
                }
            })
        }

        drawD3Force({
            svg, simulation, height, width,
            dragFun,
            handleRightClick,
            nodes,
            links,
            setLinks,
        })

        // 添加点击事件监听器
        svgClickListener()

        // 添加缩放功能
        const zoom = d3.zoom()
            .scaleExtent([0.1, 5]) // 设置缩放范围
            .on('zoom', (event) => {
                svg.attr('transform', event.transform);
                setZoomValue((event.transform.k).toFixed(1)); // Update zoom value state
            })
            .on('end', () => {
                clearNodesForce({setNodes})
                // 更新父 DOM 的宽度
                // const container = containerRef.current;
                // container.style.width = `${svgRef.current.getBoundingClientRect().width}px`;
            })
        svg.call(zoom);

        // Reset zoom on button click
        const resetZoomFun = () => {
            if (!svgRef.current) return;
            const svg = d3.select(svgRef.current);
            const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);

            svg.transition()
                .duration(750)
                .call(zoom.transform, initialTransform);

            setZoomValue(1); // Reset zoom value state
        }

        addResetFunInButton({fun: resetZoomFun})

        return () => {
            simulation.stop();
            removeResetFunInButton({fun: resetZoomFun})
        };
    }, [nodes, links]); // 注意依赖数组中包含了 nodes 和 links
    // 更新边的位置

    const svgClickListener = () => {
        const svg = d3.select(svgRef.current);
        // 监听整个 SVG 的右键点击事件
        svg.on('contextmenu', handleRightClick)
    }

    useEffect(() => {
        svgClickListener()
    }, [type])


    const addNode = ({x, y, id}) => {
        const newNode = addNodeByXYPosition({x, y, id, svgRef, setNodes})
        setAddNodeDetail(newNode)
    }

    const addLink = ({startNode, endNode}) => {
        addLinkWidthStartEndNode({startNode, endNode, setLinks})
        setSelectedNode(null); // 重置已选择的节点
    }

    const deleteNode = (nodeId) => {
        deleteNodeAndLinksByNodeId({
            nodeId, setLinks, setNodes, nodes, links
        })
        setSelectedNode(null);
    };
    const deleteLink = (link) => {
        deleteLinkByLink({link, setLinks})
        setSelectedLink(null);
    };

    const updateNode = (data) => {
        updateNodesByNode({setNodes, data})
        setAddNodeDetail(null)
    }

    const [addNodeDetail, setAddNodeDetail] = useState(null)


    const [popoverPosition, setPopoverPosition] = useState({})
    const [popoverVisible, setPopoverVisible] = useState(false)
    const [clickType, setClickType] = useState('')// node link context
    let handleRightClickList=[]
    const handleRightClick = (event, d) => {
        if (readOnly) {
            return
        }
        if (d){
            clearNodesForce({setNodes})
            const {type, x, y} = handleContextMenu(event)
            setClickType(type)
            setPopoverPosition({x, y})
            setPopoverVisible(true)
            if (type === 'node' && d) {
                setSelectedNode(d)
            } else if (type === 'link' && d) {
                setSelectedLink(d);
            }
            handleRightClickList=[]
        }else{
            handleRightClickList.push(true)
        }


        if (handleRightClickList.length >1){
            handleRightClickList=[]
            clearNodesForce({setNodes})
            const {type, x, y} = handleContextMenu(event)
            setClickType(type)
            setPopoverPosition({x, y})
            setPopoverVisible(true)
        }

    }
    const initMenuData = () => {
        setClickType('')
        setPopoverPosition({})
        setPopoverVisible(false)
    }
    const [linkNodes, setLinkNodes] = useState([])
    const handleSelectMenuTypeChange = (type) => {
        setType(type)
        switch (type) {
            case 'addNode':
                addNode(popoverPosition)
                initMenuData()
                break
            case 'addLinkStart':
                setLinkNodes([selectedNode, null])
                // 高亮当前点击的节点
                hightlightNode(selectedNode.id);
                break
            case 'addLinkEnd':
                setLinkNodes([linkNodes[0], selectedNode])
                addLink({startNode: linkNodes[0], endNode: selectedNode})
                setSelectedNode(null)
                setLinkNodes([])
                initMenuData()
                break
            case 'deleteNode':
                deleteNode(selectedNode?.id);
                break;
            case 'deleteLink':
                deleteLink(selectedLink);
                break;
            default:
                break
        }
    }

    const nodesAndLinksData = useMemo(() => {
        const target = {
            edges: links.map(item => ({
                source: item.source?.id || item.source,
                target: item.target?.id || item.target,
                label: item.label || 'HAS'
            })).filter(item => !item.target.includes('fake_')),
            nodes: nodes.map(item => {
                let obj = {
                    id: item.id,
                    label: item.label || item.type,
                    properties: {
                        name: item.name,
                        ...item.properties,
                    }
                }
                if (obj.label === 'RULE') {
                    obj.factList = item.factList || []
                    obj.optList = item.optList || []
                }
                return obj
            })
        }
        return target
    }, [nodes, links])


    const updateDataAfterNodeDialog = (res) => {
        if (res.type === LABEL_RULE) {
            handleRuleTypeAdd({
                setNodes,
                res,
                setLinks
            })
        } else {
            updateNode(res)
        }
    }

    return (
        <div style={{height: '80vh'}}>
            <BaseLoadingSkeleton loading={loading}>
                <div style={{width: '100%', height: '100%', display: 'flex'}}>
                    <div ref={containerRef} className={'mr-2 flex flex-col'} style={{
                        flex: 1,
                        overflow: 'auto',
                        height: '100%',
                        background: '#fdfcfc',
                        border: '1px solid #f0f0f0'
                    }}>
                        <svg ref={svgRef} style={{width: '100%'}} className={'flex-1'}></svg>
                        <div style={{
                            height: '20px',
                            borderTop: '1px solid #f0f0f0'
                        }} className={'flex justify-between items-center p-2'}>
                        <span className={'flex items-center'}>
                            <div className={'mx-2 w-20'}>Zoom: {zoomValue}</div>
                            <Button id={'reset-button'} variant="outline" size={'sm'}>Back Center</Button>
                        </span>

                            {!readOnly &&
                                <div>
                                    <Button size={'sm'} variant="outline"
                                            style={{marginRight: '10px'}}
                                            onClick={() => {
                                                clearAll({svgRef})
                                                setNodes([])
                                                setLinks([])
                                                setClickNode(null)
                                                setSelectedLink(null)
                                                setSelectedNode(null)
                                            }}>Clear</Button>
                                    <DraftHandleButton data={nodesAndLinksData} id={graphId} nodeLabel={nodeLabel}/>
                                </div>
                            }
                        </div>
                    </div>
                    <NodeDetailPanel clickNode={clickNode}
                                     canEdit={!readOnly}
                                     updateDataAfterNodeDialog={res => {
                                         if (res.type === 'RULE') {
                                             updateRuleNode({ruleNode: res, nodes, links, setNodes, setLinks})
                                         } else {
                                             updateDataAfterNodeDialog(res)
                                         }
                                         setClickNode(res)
                                     }}/>
                </div>
            </BaseLoadingSkeleton>
            <AddNodeModal data={addNodeDetail}
                          updateData={updateDataAfterNodeDialog}
                          onCancel={() => deleteNode(addNodeDetail.id)}/>
            <MenuPopover popoverPosition={popoverPosition}
                         popoverVisible={popoverVisible}
                         setPopoverVisible={setPopoverVisible}
                         clickType={clickType}
                         hasStartNode={!!linkNodes[0]}
                         onChange={handleSelectMenuTypeChange}
            />
        </div>
    );
};

export default ForceGraph;
