// Function to create a new graph through the UI


import request from "@/api/request.js";

export function queryFeatures(data) {
    return request('/graph-node/features',{ method:'get'})
}

export function createGraphFromUI(){
    return request('/sage/graph/create', { method:'post'})
}

export function exportJira(data) {
    return request('/export/jira/questions',{ method:'post', data})
}



export function addGraphNode(data) {
    return request('/graph-node',{ method:'post', data})
}

export function updateGraphNode(data) {
    return request(`/graph-node/${data.id}`,{ method:'put', data})
}

export function deleteGraphNode(data) {
    return request(`/graph-node/${data.id}`,{ method:'delete', data})
}

export function queryNodeList(data) {
    return request('/graph-node',{ method:'get', data})
}

export function queryGraphNodeDetail(data) {
    return request(`/graph-node/${data.id}`,{ method:'get', data})
}

export function publishGraphNode(data) {
    return request(`/graph-node/draw`,{ method:'post', data})
}


export function queryApiUrl() {
    // return request('/setting/api-url',{ method:'get'})
    return new Promise((resolve, reject) => {
        resolve({data: 'https://localhost:8080'})
    })
}

export function updateApiUrl(data) {
    // return request('/setting/api-url',{ method:'post', data})
    return new Promise((resolve, reject) => {
        resolve(true)
    })
}
