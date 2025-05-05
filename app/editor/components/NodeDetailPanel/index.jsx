"use client"

import {getTargetColorByNode, LABEL_FACT} from "../../utils.js";
import {isArrayOrObject} from "@/utils/common.js";
import {Pencil, Squirrel} from "lucide-react";
import CopyText from "@/components/CopyText.jsx";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import AddNodeModal from "@/app/editor/components/AddNodeModal";

export default function NodeDetailPanel({clickNode, canEdit=true, updateDataAfterNodeDialog=()=>{}}) {
    const [open, setOpen] = useState(false)
    const isFact = clickNode?.label === LABEL_FACT
    return <div className={'rounded w-64 p-3 text-sm overflow-auto'} style={{border:'1px solid #f0f0f0'}}>
        {
            clickNode ?
                <div>
                    <div className={'showBox'}>
                        <div className={'mb-2 flex items-center'}>
                            <div className={'flex justify-between items-center' }>
                                 <span className={'text-white py-1 px-2 rounded'} style={{
                                     background: getTargetColorByNode(clickNode) || 'black',
                                 }}>{clickNode?.label}</span>

                                {
                                    canEdit && !isFact &&
                                    <Button size={'sm'} variant="outline"  className={'ml-2 cursor-pointer'}
                                    onClick={()=>setOpen(true)}>
                                        <Pencil/> Edit
                                    </Button>
                                }
                                {
                                    canEdit && isFact && <span className={'ml-2 text-gray-400'}>edit in rule</span>
                                }

                            </div>
                        </div>
                        {Object.keys(clickNode?.properties || {}).map((key, index) => {
                            const val = clickNode?.properties[key]
                            const showText = isArrayOrObject(val) ? JSON.stringify(val) : val
                            return <div key={index} className={'flex p-1 mb-2 justify-between space-x-2'}
                                        style={{background: index % 2 === 0 ? '#f0f0f0' : '',}}>
                                <span className={'inline-block w-24 font-bold'}>{key}:</span>
                                <span className={'break-all flex-1 text-gray-600'}>{showText}</span>
                                {showText && <CopyText copyable={{text: showText}}/>}
                            </div>
                        })}
                    </div>
                </div> : <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Squirrel  size={40}/>
                    <div className={'mt-2'}>
                        Click Node to view detail
                    </div>
                </div>
        }
        {open &&  <AddNodeModal data={clickNode}
                                updateData={res => {
                                    updateDataAfterNodeDialog(res)
                                    setOpen(false)
                                }}
                                onCancel={()=>{setOpen(false)}}
                                />}
    </div>
}
