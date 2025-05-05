"use client"

import {useEffect, useMemo, useState} from "react";
import {addQuotesToStrings, generateRuleExpression, validateExpression} from "../../../service.js";
import {Trash2, PlusCircle, StepForward, CircleHelp, ChevronRight, ChevronLeft, Edit} from "lucide-react";
import {betterUUID} from "@/utils/common.js";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import CopyText from "@/components/CopyText.jsx";
import BasePopover from "@/components/BasePopover.jsx";
import RuleForm from "@/app/editor/components/AddNodeModal/form/RuleForm.jsx";
import AddOptDialog from "@/app/editor/components/AddNodeModal/rule/AddOptDialog.jsx";
import BaseTable from "@/components/BaseTable.jsx";
import FactTableShow from "@/app/editor/components/AddNodeModal/fact/FactTableShow.jsx";
import AddFactNodes from "@/app/editor/components/AddNodeModal/fact/AddFactNodes";

const PopoverInfo = () => <div className={'whitespace-pre'}>
    {`Example:
1.{{Q1}} == true
2.{{Q2}} == "answer1"`}
</div>


const RuleFormItems = ({
                           factList = [],
                           optList = [],
                           onChange = () => {
                           }
                       }) => {
    const [currentList, setCurrentList] = useState(optList || [])
    const [optDialogOpen, setOptDialogOpen] = useState(false)
    const [selectOptStr, setSelectOptStr] = useState('')

    useEffect(() => {
        onChange(currentList || [])
    }, [currentList])

    const expression = useMemo(() => {
        if (currentList?.length && factList?.length) {
            const factKeys = factList.map(item => `"${item.key}"`).join(',')
            const optListStr = currentList.map((opt, index) => {
                const newOpt = addQuotesToStrings(opt)
                return `["${newOpt.replaceAll('"', '\'').trim()}", "OPT_${index + 1}"]`
            }).join(',')
            return JSON.stringify(`match(${factKeys}).with([${optListStr}]);`)
        }
        return ''
    }, [currentList, factList])

    function formatJsonString(jsonStr) {
        try {
            return jsonStr
                .replace(/match\(([^)]+)\)/, (match, p1) => {
                    return `match(\n${p1.split(',').map(s => s.trim()).join(',\n')}\n)`;
                })
                .replace(/\(\[/g, '([\n') // Replace ([ with ([\n
                .replace(/,(\S)/g, ',\n$1') // Add newline after comma
                .replace(/(\n\s*)\n/g, '\n') // Remove extra newlines
                .replace(/(in|contains)\s*\[\s*\n/g, '$1 [') // Keep array on the same line after in/contains
                .replace(/\n\s*\]/g, ' ]') // Keep array on the same line before closing bracket
                .replace(/with\s*\[\s*\n/g, 'with [\n') // Add newline after with [
                .replace(/\n\s*\]\s*\n/g, '\n]') // Add newline before closing bracket of with [
                .replace(/\]\]/g, ']\n]'); // Replace ]] with ]\n]
        } catch (e) {
            return jsonStr;
        }
    }

    const expressionShow = useMemo(() => {
        return formatJsonString(expression)
    }, [expression])

    const add = () => {
        // setCurrentList([...currentList, ''])
        setOptDialogOpen(true)
    }

    const remove = (index) => {
        setCurrentList(currentList.filter((item, idx) => idx !== index))
    }

    const columns = [
        {
            title: "Label",
            key: "label",
            type: "label"
        },
        {
            title: "Opt",
            key: "opt",
            type: "opt"
        },
        {
            title: "Setting",
            key: "setting",
            type: "setting",
            width: 50,
            render: (text, record) => {
                return <div className={'flex space-x-2'}>
                    <Trash2 size={16}
                            onClick={() => remove(record.index)}
                            style={{color: 'red', cursor: 'pointer'}}
                    />

                    <Edit size={16}
                          onClick={() => {
                              setOptDialogOpen(true)
                              setSelectOptStr(record.label)
                          }}
                          style={{cursor: 'pointer'}}/>
                </div>
            }
        }
    ]

    return (<div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span className={'space-x-2'}>
                     <span style={{marginRight: '10px'}}>Opt List</span>
                     <Button onClick={add} size={'sm'}>
                          <PlusCircle/>
                           Add Opt
                     </Button>
                       <BasePopover content={<PopoverInfo/>}>
                            <CircleHelp size={16}/>
                         </BasePopover>
                </span>
            <BasePopover content={<FactTableShow factList={factList} canEdit={false}/>}>
                <Button variant="secondary" size={'sm'}>View Facts Detail</Button>
            </BasePopover>
        </div>
        <div className={'mt-2'}>
            <BaseTable columns={columns}
                       dataSource={currentList.map((it, index) => ({
                           key: index,
                           label: it,
                           opt: `OPT_${index + 1}`,
                           index
                       }))}/>
        </div>
        <div>
            {expression?.length > 0 &&
                <div className={'mt-2 p-2 rounded-xl overflow-auto'} style={{border: '1px solid rgb(206 204 204)'}}>
                    <pre className={'whitespace-pre break-words w-40 '}>{expressionShow}</pre>
                    <CopyText copyable={{text: expression}} className={'ml-1'}/>
                </div>}
        </div>
        {optDialogOpen && <AddOptDialog
            factList={factList}
            defaultOpt={selectOptStr}
            onClose={() => {
                setOptDialogOpen(false)
                setSelectOptStr('')
            }}
            onChange={(opt) => {
                if (selectOptStr) {
                    setCurrentList(currentList.map(it => it === selectOptStr ? opt : it))
                } else {
                    setCurrentList([...currentList, opt])
                }
            }}/>}
    </div>);
};


export default function RuleModalContent({data, onChange, onClose}) {
    const [factList, setFactList] = useState([])
    const [optList, setOptList] = useState([])
    const [currentStep, setCurrentStep] = useState(0);
    const [ruleAllData, setRuleAllData] = useState(data || {})

    const [saveFactList, setSaveFactList] = useState([])

    useEffect(() => {
        setFactList(data?.factList || [])
        setOptList(data?.optList || [])
    }, [data])


    const updateRuleNodeData = (myData) => {
        setRuleAllData({...ruleAllData, ...myData})
        setCurrentStep(1)
    }

    const isModifyFactList = useMemo(() => {
        if (optList?.length >0){
            if (data?.factList?.length > 0) {
                if (saveFactList?.length > 0) {
                    return JSON.stringify(saveFactList) !== JSON.stringify(factList)
                }
                return JSON.stringify(data?.factList) !== JSON.stringify(factList)
            } else if (saveFactList?.length > 0) {
                return JSON.stringify(saveFactList) !== JSON.stringify(factList)
            }
        }
        return false
    }, [data, factList, saveFactList, optList])

    const next = () => {
        if (currentStep === 1) {
            if (!factList.length) {
                toast.error('please add fact')
                return
            }
            if (isModifyFactList) {
                toast.warning('It has been detected that you have modified the Fact. Please rewrite your Opt.')
                setOptList([])
            }
            setSaveFactList(factList)
        }
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const finish = () => {
        if (!optList?.length) {
            toast.error('please add opt')
            return
        }
        if (optList?.some(item => item.trim()?.length === 0)) {
            toast.error('opt cannot be empty, please fill it')
            return
        }
        // if (!validate()) return
        const values = {
            ...ruleAllData, type: 'RULE'
        }

        if (optList.length) {
            if (optList.includes('')) {
                // toast({
                //     title: 'opt can not be empty'
                // })

                return;
            }
        }

        const key = betterUUID()

        const formData = {
            ...data,
            isAdd: true,
            key,
            name: values.name,
            type: values.type,
            label: values.type,
            factList,
            optList,
            properties: {
                key, name: values?.name, expression: generateRuleExpression({optList, factList})
            },
        };
        console.log('formData:', formData)
        onChange && onChange(formData);
    };

    const validate = () => {
        const valid = validateExpression({factList, optList})
        if (valid) {
            toast.success("Validate Success")
        } else {
            toast.error("Validate Failed")
        }
        return valid
    }

    return (<div>
        <div className={'mb-2 font-bold flex items-center'}>
            <StepForward/>
            {currentStep === 0 && <span>Step 1: Define Rule Node</span>}
            {currentStep === 1 && <span>Step 2: Add Fact Nodes</span>}
            {currentStep === 2 && <span>Step 3: Configure Opts</span>}
        </div>
        <div>
            {currentStep === 0 &&
                <RuleForm originData={ruleAllData}
                          submit={updateRuleNodeData}
                          footer={<div className={'flex justify-end'}>
                              <Button type="submit"><ChevronRight/>Next</Button>
                              {/*<Button variant="outline" onClick={onClose}>Cancel</Button>*/}
                          </div>}/>}

            {currentStep === 1 &&
                <div>
                    <AddFactNodes factList={factList} setFactList={list => {
                        setFactList(list)
                    }}/>
                    {isModifyFactList &&
                        <div className={'text-sm mt-1 text-orange-400'}>It has been detected that you have modified the
                            Fact. Please rewrite your Opt.</div>}
                    <div className={'mt-10 flex justify-between'}>
                        <Button onClick={prev} variant="secondary">
                            <ChevronLeft/>
                            Previous
                        </Button>
                        <Button onClick={next}><ChevronRight/>Next</Button>
                    </div>
                </div>}

            {currentStep === 2 &&
                <div>
                    <RuleFormItems optList={optList} factList={factList} onChange={setOptList}/>
                    <div className={'mt-10 flex justify-between'}>
                        <Button onClick={prev} variant="secondary">
                            <ChevronLeft/>
                            Previous
                        </Button>
                        <span className={'space-x-2'}>
                              {/*<Button onClick={validate} variant="destructive">Validate</Button>*/}
                            <Button onClick={finish}>Submit</Button>
                        </span>
                    </div>
                </div>}
        </div>
    </div>)
}
