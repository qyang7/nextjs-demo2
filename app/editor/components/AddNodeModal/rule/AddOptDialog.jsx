"use client"

import BaseDialog from "@/components/BaseDialog.jsx";
import BaseSelect from "@/components/BaseSelect.jsx";
import {Label} from "@/components/ui/label";
import {useEffect, useMemo, useState} from "react";
import BaseSelectMulti from "@/components/BaseSelectMulti.jsx";
import {PlusCircle, Trash2} from "lucide-react";
import {generateUUID} from "@/app/editor/service.js";
import {toast} from "sonner";

const AllOperatorOptions = ['==', '!=', 'in', 'contains', '.count==', '.count!=', '.count>=', '.count<=', '.count>', '.count<']

const RadioOptions = ['==', '!=']
const RadioDIYOptions = ['==', '!=', 'in']
const CheckBoxOptions = ['in', 'contains', '.count==', '.count!=', '.count>=', '.count<=', '.count>', '.count<']

const CheckMultiOptions = ['in', 'contains']

const MoreOptions = [
    {label: 'OR', value: '||'},
    {label: 'AND', value: '&&'},
]

const ShortExpressionItem = ({
                                 factList = [], finish,
                                 defaultSelectFact = '',
                                 defaultSelectOperator = '',
                                 defaultSelectAnswers = []
                             }) => {

    const [selectFact, setSelectFact] = useState(defaultSelectFact)
    const [selectOperator, setSelectOperator] = useState(defaultSelectOperator)
    const [selectAnswers, setSelectAnswers] = useState(defaultSelectAnswers)

    const operatorOptions = useMemo(() => {
        let result = AllOperatorOptions
        if (selectFact) {
            const targetFact = factList.find(item => item.key === selectFact)
            const type = targetFact?.properties?.option_type
            if (type === 'radio') {
                const options = targetFact?.properties?.options || []
                if (options?.length === 2 && options?.includes('true') && options?.includes('false')) {
                    result = RadioOptions
                } else {
                    result = RadioDIYOptions
                }
            } else {
                result = CheckBoxOptions
            }
        }
        return result.map(item => ({label: item, value: item}))
    }, [selectFact])

    const answerOptions = useMemo(() => {

        if (selectFact) {
            const targetFact = factList.find(item => item.key === selectFact)
            const answers = targetFact?.properties?.options?.map(item => ({label: item, value: item}))

            if (selectOperator && selectOperator.includes('.count')) {
                const nums = Array(answers.length + 1).fill(undefined).map((_, index) => ({
                    label: index + '',
                    value: index + ''
                }))
                return nums
            }

            return answers
        }
        return []
    }, [selectFact, selectOperator])

    const isMulti = useMemo(() => {
        return CheckMultiOptions.includes(selectOperator)
    }, [selectOperator])

    const selectFactQuestion = useMemo(() => {
        const targetFact = factList.find(item => item.key === selectFact)
        return targetFact?.properties?.prompt || ''
    }, [selectFact])

    useEffect(() => {
        const targetFact = factList.find(item => item.key === selectFact)
        const mockLabel = targetFact?.mockLabel || ''
        finish && finish({
            selectFact,
            selectOperator,
            selectAnswers,
            selectFactLabel: mockLabel,
            isMulti
        })
    }, [selectFact, selectOperator, selectAnswers]);

    return <div>
        <div className={'flex space-x-2'}>
            <div>
                <Label>Fact Node</Label>
                <BaseSelect className={'w-20'}
                            value={selectFact}
                            onChange={val => {
                                setSelectFact(val)
                                setSelectOperator('')
                                setSelectAnswers([])
                            }}
                            options={factList?.map((fact) => ({
                                label: fact.mockLabel,
                                value: fact.key
                            }))}/>
            </div>
            <div>
                <Label>Operator</Label>
                <BaseSelect className={'w-28'} disabled={!selectFact}
                            value={selectOperator}
                            onChange={val => {
                                setSelectOperator(val)
                            }}
                            options={operatorOptions}/>
            </div>
            <div>
                <Label>Answer</Label>

                {isMulti ? <BaseSelectMulti
                        value={selectAnswers}
                        onChange={val => {
                            setSelectAnswers(val)
                        }}
                        options={answerOptions}
                        className={'w-32'}
                        disabled={!selectFact || !selectOperator}/> :
                    <BaseSelect className={'w-32'}
                                value={selectAnswers[0]}
                                disabled={!selectFact || !selectOperator}
                                onChange={val => {
                                    setSelectAnswers([val])
                                }}
                                options={answerOptions}/>}

            </div>
        </div>
        <div className={'text-xs text-gray-600 mt-1'}>{selectFactQuestion ? `Prompt: ${selectFactQuestion}` : ''} </div>
    </div>
}

const generateDefault = () => {
    return {
        id: generateUUID(),
        selectFact: '',
        selectOperator: '',
        selectAnswers: [],
        selectFactLabel: '',
        addMore: '',
        isMulti: false
    }
}

export default function AddOptDialog({onClose, factList = [], onChange, defaultOpt}) {
    const [list, setList] = useState([])

    useEffect(() => {
        if (defaultOpt) {
            const parts = defaultOpt.split(/\s*(\|\||&&)\s*/);
            let newList = parts.map((part, index) => {
                const match = part.match(/(\{\{Q(\d+)\}\})\s*(==|!=|in|contains|\.count==|\.count!=|\.count>=|\.count<=|\.count>|\.count<)\s*(.*)/);
                if (match) {
                    const [, selectFactLabel, factIndex, selectOperator, answers] = match;
                    const selectFact = factList[factIndex - 1]?.key || '';
                    const selectAnswers = answers.startsWith('[') ? JSON.parse(answers.replace(/'/g, '"')) : [answers.replace(/'/g, '')];
                    return {
                        id: generateUUID(),
                        selectFact,
                        selectOperator,
                        selectAnswers,
                        selectFactLabel,
                        addMore: index < parts.length - 1 ? parts[index + 1] : '',
                        isMulti: CheckMultiOptions.includes(selectOperator),
                        index
                    };
                }
                return generateDefault();
            });
            newList = newList.filter(item => item.selectFact).map((item, index) => ({...item, index}))
            setList(newList);
        } else {
            setList([{
                index: 0,
                ...generateDefault(),
            }])
        }
    }, []);

    const submit = () => {
        for (const item of list) {
            const {selectFactLabel, selectAnswers, selectOperator} = item;
            if (!selectFactLabel || !selectAnswers.length || !selectOperator) {
                toast.error(selectFactLabel ? selectFactLabel + ':' : '' + 'Please fill all the fields');
                return;
            }
        }

        let str = list.map(item => {
            const {selectFactLabel, selectAnswers, selectOperator, addMore, isMulti} = item
            const valid = selectFactLabel && selectAnswers?.length && selectOperator
            const answerStr = isMulti ? `[${selectAnswers.map(answer => `'${answer}'`).join(', ')}]` : `'${selectAnswers[0]}'`
            if (valid) {
                return `${selectFactLabel}${!selectOperator.includes('.count') ? ' ' : ''}${selectOperator} ${answerStr} ${addMore}`
            } else {
                return ''
            }
        }).join(' ')

        str = str?.trim()

        // Remove trailing && or ||
        str = str.replace(/(\|\||&&)\s*$/, '');


        onChange && onChange(str)
        onClose && onClose()
    }


    return <BaseDialog open={true} title={'Add Opt'}
                       width={1000}
                       onCancel={onClose}
                       onOk={submit}>
        <div>
            {list.map((item, index) => {
                return <div className={'flex mb-2'} key={item.id}>
                    <ShortExpressionItem
                        defaultSelectFact={item?.selectFact}
                        defaultSelectOperator={item?.selectOperator}
                        defaultSelectAnswers={item?.selectAnswers}
                        factList={factList.map((fact, ind) => ({...fact, mockLabel: `{{Q${ind + 1}}}`}))}
                        finish={obj => {
                            setList(list.map(it => it.id === item.id ? {...it, ...obj} : it))
                        }}/>

                    <div className={'ml-2'}>
                        <Label className={'flex items-center mb-1.5 text-gray-600'}>
                            <PlusCircle size={13} className={'mr-1'}/>
                            <span className={'text-xs'}>AddMore?</span>
                        </Label>
                        <BaseSelect placeholder={''} value={item.addMore} className={'w-20'}
                                    onChange={val => {
                                        let newList = list.map((it, idx) => it.id === item.id ? ({
                                            ...it,
                                            addMore: val
                                        }) : it)
                                        if (item.id === newList[newList.length - 1]?.id) {
                                            newList = [...newList, {index: newList.length + 1, ...generateDefault()}]
                                        }
                                        setList(newList)
                                    }}
                                    options={MoreOptions}/>
                    </div>

                    {list?.length > 1 && index !== 0 &&
                        <div className={'text-xs text-red-600 flex items-center ml-2 cursor-pointer'}
                             onClick={() => {
                                 let newList = list
                                     .filter(it => it.id !== item.id).map((it, ind) => ({...it, index: ind + 1}))
                                 newList = newList.map((it, idx) =>
                                     idx === newList?.length - 1 ? ({
                                         ...it,
                                         addMore: ''
                                     }) : it)
                                 setList(newList)
                             }}>
                            <Trash2 size={18}/>
                            <span>Delete</span>
                        </div>}
                </div>
            })
            }
        </div>
    </BaseDialog>
}