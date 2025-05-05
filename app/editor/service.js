

export const generateRuleNodeByDraft = (ruleNode={}) => {
    delete ruleNode.properties.optList
    delete ruleNode.properties.factList
    return ruleNode
}

export function addQuotesToStrings(inputStr) {
    // 正则表达式匹配 `==` 后面是一个字母、数字、或下划线的部分，排除 true 和 false
    const regexEquals = /==\s*([a-zA-Z0-9_]+)(?=\s|$|[^'"])/g;

    // 正则表达式匹配 `contains` 数组中的元素
    const regexContains = /contains\s*\[\s*([^\]]+)\s*\]/g;

    // 处理 `==` 后的字符串
    inputStr = inputStr.replace(regexEquals, (match, p1) => {
        if (p1 !== 'true' && p1 !== 'false') {
            return `== '${p1}'`;  // 为非 true 或 false 的字符串加引号
        }
        return match;  // 如果是 true 或 false，不做任何修改
    });

    // 处理 `contains` 数组中的字符串元素
    inputStr = inputStr.replace(regexContains, (match, p1) => {
        // 对数组内的每个元素进行处理
        const elements = p1.split(',').map(element => element.trim());
        const newElements = elements.map(element => {
            // 如果元素是字母数字且没有引号，就加上引号
            if (!/['"]/.test(element) && /[a-zA-Z0-9_]+/.test(element)) {
                return `'${element}'`;
            }
            return element;  // 已有引号的元素不做更改
        });

        // 返回包含引号的数组
        return `contains [${newElements.join(', ')}]`;
    });

    return inputStr;
}


// 生成规则表达式
/**
 * match LAMBDA_API_FACT_HS:Boolean {
 *
 * LAMBDA_API_FACT_HS == true => OPT_2,
 *  _ => OPT_1
 *
 *  }
 */
export const generateRuleExpression = ({ optList, factList }) => {
    if (optList?.length && factList?.length ){
        const factKeys = factList.map(item => `"${item.key}"`).join(',')
        const newFacList = factList.map((fact, index) => ({...fact, index: `{{Q${index + 1}}}`}))
        const optListStr = optList.map(opt => {
            let newOpt = addQuotesToStrings(opt)
            newFacList.forEach(target => {
                newOpt=newOpt.replaceAll(target.index, target.key)
            })
           return newOpt
        }).map((opt, index) => `["${opt.replaceAll('"','\'').trim()}", "OPT_${index + 1}"]`).join(',')
        return `match(${factKeys}).with([${optListStr}]);`
    }
    return ''
};

// 处理规则类型添加
export const handleRuleTypeAdd = ({ res, setNodes, setLinks }) => {
    if (res.type !== 'RULE') return;

    const radius = 70; // 设置距离 res 的长度
    const factNodes = createFactNodes(res, radius);
    const factLinks = factNodes.map(item => ({ source: item.id, target: res.id, label:'REQUIRE' }));
    const newLinks = createOptLinks(res, radius);

    const realRuleNode = generateRuleNodeByDraft(res);
    setNodes(preNodes => [...preNodes, ...factNodes].map(item => item.id === res.id ? realRuleNode : item));
    setLinks(prevLinks => [...prevLinks, ...factLinks, ...newLinks]);
};

// 创建 Fact 节点
const createFactNodes = (res, radius) => {
    const factAngleStep = res.factList.length > 1 ? (90 * Math.PI / 180) / (res.factList.length - 1) : 0;
    const startAngle = 315 * Math.PI / 180; // 起始角度 315 度

    return res.factList.map((it, index) => {
        const id = it.id;
        const angle = startAngle + index * factAngleStep;
        const x = res.x + radius * Math.cos(angle);
        const y = res.y + radius * Math.sin(angle);
        return { ...it, x, y, fx: x, fy: y, id };
    });
};

// 创建 Opt 链接
const createOptLinks = (res, radius) => {
    const optAngleStep = res.optList.length > 1 ? (90 * Math.PI / 180) / (res.optList.length - 1) : 0;
    const startAngle = 135 * Math.PI / 180; // 起始角度 135 度

    return res.optList.map((it, index) => {
        const angle = startAngle + index * optAngleStep;
        const x = res.x + radius * Math.cos(angle);
        const y = res.y + radius * Math.sin(angle);

        return {
            source: res.id,
            target: { id: `fake_${index}`, fake: true, x, y },
            label: `OPT_${index + 1}`
        };
    });
};

// 清除节点的力学属��
export const clearNodesForce = ({ setNodes }) => {
    setNodes(prevNodes => {
        prevNodes.forEach(node => {
            node.fx = node.x;
            node.fy = node.y;
        });
        return [...prevNodes];
    });
};

// 根据节点更新节点
export const updateNodesByNode = ({ setNodes, data }) => {
    setNodes(prevNodes => prevNodes.map(item => item.id === data.id ? data : item));
};

// 生成 UUID
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 根据 XY 位置添加节点
export const addNodeByXYPosition = ({ x, y, id, svgRef, setNodes }) => {
    const boundingRect = svgRef.current.getBoundingClientRect();
    const newNode = {
        id: id || generateUUID(),
        x: x - boundingRect.left,
        y: y - boundingRect.top,
        fx: x - boundingRect.left, // 固定位置
        fy: y - boundingRect.top   // 固定位置
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
    return newNode;
};

// 简单删除节点��链接
const deleteNodeAndLinksByNodeIdSimple = ({ nodeIds = [], setNodes, setLinks }) => {
    setNodes(prevNodes => prevNodes.filter(node => !nodeIds.includes(node.id)));
    setLinks(prevLinks => prevLinks.filter(link => !nodeIds.includes(link.source.id) && !nodeIds.includes(link.target.id)));
};

// 删除规则块
export const deleteRuleBlock = ({ nodeId, setNodes, setLinks, links, nodes }) => {
    const allKeys = links.filter(item => item.target.id === nodeId).map(item => item.source.properties.key);
    const factIds = nodes.filter(item => allKeys.includes(item.properties.key) && (item.type === 'FACT' || item.label === 'FACT')).map(item => item.id);
    const deleteIds = [...factIds,nodeId];
    deleteNodeAndLinksByNodeIdSimple({ nodeIds: deleteIds, setNodes, setLinks });
};

export const updateRuleNode=({ruleNode, nodes, links, setNodes, setLinks})=>{
    const newNode = {...nodes.find(item => item.id === ruleNode.id), ...ruleNode}
    deleteRuleBlock({nodeId: ruleNode.id, setNodes, setLinks, links, nodes})

    setTimeout(()=>{
        setNodes(pre => [...pre, newNode])
        setTimeout(()=>{
            handleRuleTypeAdd({res: newNode, setNodes, setLinks})
        })
    })
}

// 根据节点 ID 删除节点和链接
export const deleteNodeAndLinksByNodeId = ({ nodeId, setNodes, setLinks, nodes, links }) => {
    if (!nodeId) return;
    const target = nodes.find(node => node.id === nodeId);
    if (target?.type === 'RULE' || target?.label === 'RULE') {
        deleteRuleBlock({ nodeId, setNodes, setLinks, links, nodes });
    } else {
        deleteNodeAndLinksByNodeIdSimple({ nodeIds: [nodeId], setNodes, setLinks });
    }
};

// 根据链接删除链接
export const deleteLinkByLink = ({ setLinks, link }) => {
    if (!link) return;
    setLinks(prevLinks => prevLinks.filter(l =>
        !(l.source.id === link.source.id && l.target.id === link.target.id) &&
        !(l.source.id === link.target.id && l.target.id === link.source.id)
    ));
};

// 添加链接
export const addLinkWidthStartEndNode = ({ startNode, endNode, setLinks }) => {
    setLinks(prevLinks => [...prevLinks, { source: startNode.id, target: endNode.id }]);
};



const match = (...args) => ({
    with: (patterns) => {
        for (let [condition, result] of patterns) {
            // Handle wildcard "_" as catch-all case
            if (condition === "_") {
                return result;
            }

            // Make a copy of the condition to work with
            let evaluatedCondition = condition;

            // DEBUG: Log before replacement
            console.log("\n[BEFORE REPLACEMENT]:", evaluatedCondition);

            // Replace placeholders with support for whitespace FIRST
            args.forEach((arg, index) => {
                const placeholderRegex = new RegExp(
                    `\\{\\{\\s*Q${index + 1}\\s*\\}\\}`,
                    "g",
                );
                evaluatedCondition = evaluatedCondition.replace(
                    placeholderRegex,
                    JSON.stringify(arg),
                );
            });

            // Add support for array length using .count or .length
            evaluatedCondition = evaluatedCondition.replace(
                /(.*?)\.count\b/g,
                "$1.length",
            );

            // Convert "[...] in [...]" => subset check
            evaluatedCondition = evaluatedCondition.replace(
                /(\[.*?\])\s+[iI][nN]\s+(\[.*?\])/g,
                (_, lhs, rhs) => {
                    // Replace single quotes with double quotes so JSON.parse can handle it (optional)
                    return `Array.from(${lhs}).every(x => ${rhs}.includes(x))`;
                },
            );

            // Ensure the value after "==" is in the array before "=="
            evaluatedCondition = evaluatedCondition.replace(
                /(\[.*?\])\s*==\s*(.*?)(?=\s*(\|\||&&|$))/g,
                (_, arr, val) => {
                    // Check if val is not a string and does not have quotes
                    if (!/^['"]/.test(val) && isNaN(val)) {
                        val = `'${val}'`;
                    }
                    return `${arr}.includes(${val})`;
                }
            );

            // Convert "contains" to ".some()" for array subset
            evaluatedCondition = evaluatedCondition.replace(
                /(\[.*?\])\s+[cC][oO][nN][tT][aA][iI][nN][sS]\s+(\[.*?\])/g,
                (_, arr, subset) =>
                    `Array.from(${subset}).every(x => ${arr}.includes(x))`,
            );

            // DEBUG: Log after replacement
            console.log("[AFTER REPLACEMENT]:", evaluatedCondition);
            // Evaluate the condition in a safe, isolated function
            try {
                const evalResult = new Function(`return ${evaluatedCondition}`)();
                console.log("[FINAL OUTCOME]:", evalResult);
                if (evalResult) {
                    return result;
                }
            } catch (error) {
                console.error("Evaluation error for condition:", evaluatedCondition);
                console.error(error);
                return undefined;
            }
        }
        // Return undefined if no pattern matches
        return undefined;
    },
});

export const validateExpression=({factList,optList})=>{
    const questionList = factList.map(fact => fact.properties?.options)
    const newOpts = optList.map((item, index) => [item, `OPT_${index+1}`])

    const result = match(...questionList).with(newOpts);
    // const result = match(questionList).with([
    //     ['{{Q1}} In  ["B3", "B2", "B1"]', "OPT_1"],
    //     ["_", "OPT_2"]
    // ]);

    console.log("Result:", result);
    return !!result
}


// Test cases
// key -> answer = true
//1wg6c5u36e20 -> true / false
//136c6q4h5j30 -> hello 2 /hello 1 / hello 3


//mock

// const result1 = match("A3").with([
//   ['{{Q1}} == "A1"', "OPT_1"],
//   ['{{Q1}} == "A2"', "OPT_2"],
//   ['{{Q1 }} == "A3"', "OPT_3"],
// ]);
// console.log("Result 1:", result1);

// const result2 = match(["A2"], ["A", "B", "C", "D"]).with([
//   ['{{ Q1 }} == "A1"', "OPT_1"],
//   ['{{  Q2  }} contains ["ABC", "B"]', "OPT_2"],
//   ['{{Q1}} == "A3"', "OPT_3"],
// ]);
// console.log("Result 2:", result2);

// const result3 = match(["A1", "A2"]).with([
//   ["{{Q1}}.count > 3", "OPT_1"],
//   ["{{Q1}}.count == 2", "OPT_2"],
//   ["_", "OPT_3"],
// ]);
// console.log("Result 3:", result3);
