"use client"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {colorOptions, LABEL_FEATURE, NodeTypeSelectOptions} from "@/app/editor/utils";

const NodeTypeSelectShow = ({seType, defaultType}) => {
    return <div style={{marginTop: 10}}>
        {defaultType ? <div className={'flex items-center'}>
            <div style={{marginRight: '10px'}}>Node Type:</div>
            <div>{defaultType}</div>
            <div style={{
                width: '20px',
                height: '20px',
                background: colorOptions.find(item => item.value === defaultType)?.color,
                marginLeft: '5px'
            }}></div>
        </div> : <div style={{display: 'flex', marginBottom: '5px', alignItems: 'center'}}>
            <b style={{marginRight: '5px', fontSize: '16px'}}>Node Type:</b>
            <Select onValueChange={seType} defaultValue={LABEL_FEATURE}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Node Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {
                            NodeTypeSelectOptions.map(option => <SelectItem value={option.value} key={option.value}>
                                <div className={'flex items-center'}>
                                    <div className={'w-4 h-4 mr-2'} style={{background: option.color}}></div>
                                    <div>{option.label}</div>
                                </div>
                            </SelectItem>)
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
            {/*<Tag color={'red'} style={{marginLeft: 10}}>required</Tag>*/}
        </div>}
        {/*<Divider style={{margin: '10px 0'}}/>*/}
    </div>
}

export default NodeTypeSelectShow
