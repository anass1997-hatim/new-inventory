import {useRef,useEffect,useCallback,useMemo,useReducer,useState} from "react"
import Container from "react-bootstrap/Container"
import {Button,Col,Dropdown,Form,InputGroup,Row} from "react-bootstrap"
import {Rnd} from "react-rnd"
import JsBarcode from "jsbarcode"
import QRCode from "qrcode"
import {useNavigate} from "react-router-dom"
import "../../CSS/label-print.css"
import {FaPrint,FaRedo} from "react-icons/fa"
import ConfirmationModal from "../modals/confirmation_delete"

const DYNAMIC_ATTRIBUTES=[
    {label:"SKU",value:"{sku}",category:"product"},
    {label:"Nom produit",value:"{nom_produit}",category:"product"},
    {label:"Prix",value:"{prix}",category:"product"}
]

const TICKET_STYLES=`@media print{.products-container,.qr-tools{display:none!important}.qr-preview{margin:0!important;padding:0!important}.configuration-Qr{padding:0!important}.print-only{display:block!important}}@page{margin:0;size:auto}`

const initialState={
    elements:[],
    selectedElement:0,
    selectedTicketSize:"500px",
    itemType:"product",
    history:[],
    currentIndex:-1
}

function reducer(state,action){
    switch(action.type){
        case "SET_ELEMENTS":
            return {
                ...state,
                elements:action.payload,
                history:[...state.history.slice(0,state.currentIndex+1),action.payload],
                currentIndex:state.currentIndex+1
            }
        case "SET_SELECTED":
            return {...state,selectedElement:action.payload}
        case "SET_SIZE":
            return {...state,selectedTicketSize:action.payload}
        case "SET_TYPE":
            return {...state,itemType:action.payload}
        case "UPDATE_ELEMENT_DIMENSION":
            const updatedEls=[...state.elements]
            updatedEls[state.selectedElement]={...updatedEls[state.selectedElement],...action.payload}
            return {...state,elements:updatedEls}
        case "DELETE_ELEMENT":
            const updatedElements=state.elements.filter((_,index)=>index!==state.selectedElement)
            return {
                ...state,
                elements:updatedElements,
                selectedElement:updatedElements.length?0:-1
            }
        default:
            return state
    }
}

function BarcodeOrQR({type,value,width,height,format,attributes=[]}){
    const barcodeRef=useRef()
    const [qrImage,setQrImage]=useState(null)
    const attributeLabels=useMemo(()=>attributes.length?attributes.map(a=>a.label).join(" "):"",[attributes])
    const scaledBarcodeWidth=Math.max((width/3)*1.5,0.5)
    const scaledBarcodeHeight=Math.max((height/2)*60,20)
    const scaledQrSize=Math.max(Math.min(width,height)*50,50)
    const processedValue=useMemo(()=>{
        if(!value||value.trim()==="")return type==="qr"?"Empty QR":"0000000000000"
        return value.trim()
    },[value,type])
    useEffect(()=>{
        if(type==="barcode"&&barcodeRef.current){
            try{
                const barcodeOptions={
                    format,
                    width:scaledBarcodeWidth,
                    height:scaledBarcodeHeight,
                    displayValue:true,
                    fontSize:16,
                    marginTop:10,
                    marginBottom:10
                }
                if(format==="EAN13"){
                    const cleanValue=(processedValue||"").replace(/[^\d]/g,"").slice(0,13)
                    if(cleanValue.length<12)throw new Error("EAN13 requires at least 12 digits")
                    barcodeOptions.format="EAN13"
                    JsBarcode(barcodeRef.current,cleanValue,barcodeOptions)
                }else if(format==="CODE39"){
                    barcodeOptions.format="CODE39"
                    JsBarcode(barcodeRef.current,processedValue,barcodeOptions)
                }else if(format==="CODE93"){
                    barcodeOptions.format="CODE93"
                    JsBarcode(barcodeRef.current,processedValue,barcodeOptions)
                }else if(format==="MSI"){
                    const cleanValue=(processedValue||"").replace(/[^\d]/g,"")
                    barcodeOptions.format="MSI"
                    JsBarcode(barcodeRef.current,cleanValue,barcodeOptions)
                }else if(format==="UPC"){
                    const cleanValue=(processedValue||"").replace(/[^\d]/g,"")
                    barcodeOptions.format="UPC"
                    JsBarcode(barcodeRef.current,cleanValue,barcodeOptions)
                }else if(format==="EAN8"){
                    const cleanValue=(processedValue||"").replace(/[^\d]/g,"").slice(0,8)
                    barcodeOptions.format="EAN8"
                    JsBarcode(barcodeRef.current,cleanValue,barcodeOptions)
                }else{
                    barcodeOptions.format="CODE128"
                    JsBarcode(barcodeRef.current,processedValue,barcodeOptions)
                }
            }catch(err){
                if(barcodeRef.current)barcodeRef.current.innerHTML=""
            }
        }else if(type==="qr"){
            QRCode.toDataURL(processedValue,{width:scaledQrSize,margin:1,errorCorrectionLevel:"M"})
                .then(url=>setQrImage(url))
                .catch(()=>{})
        }
    },[type,processedValue,format,scaledBarcodeWidth,scaledBarcodeHeight,scaledQrSize])
    if(type==="qr"){
        return(
            <div style={{margin:"0 auto",textAlign:"center",width:`${scaledQrSize}px`}}>
                {qrImage&&<img src={qrImage} alt="QR" style={{display:"block",margin:"0 auto",maxWidth:"100%",height:"auto"}}/>}
                {attributeLabels&&<div style={{fontSize:"9px",color:"gray",textAlign:"center"}}>{attributeLabels}</div>}
            </div>
        )
    }
    if(type==="EMPTY"){
        return <h4 style={{margin:"20px 0"}}>{processedValue||"{Nom}"}</h4>
    }
    return(
        <div style={{margin:"auto",display:"block"}}>
            <svg ref={barcodeRef} style={{width:"100%",height:"auto",display:"block"}}/>
            {attributeLabels&&<div style={{fontSize:"9px",color:"gray",textAlign:"center"}}>{attributeLabels}</div>}
        </div>
    )
}

function TextElement({content,fontSize}){
    return <div style={{fontSize:`${fontSize}px`,lineHeight:"1.2"}}>{content}</div>
}

export default function CreateQr({printer}){
    const [state,dispatch]=useReducer(reducer,{
        ...initialState,
        elements:printer?[{
            type:printer.type==="QR"?"qr":printer.type==="EMPTY"?"text":"barcode",
            content:printer.type==="EMPTY"?printer.value:"",
            value:printer.value,
            format:printer.format||"CODE128",
            x:50,y:50,fontSize:24,width:4,height:2,attributes:[]
        }]:[]
    })
    const navigate=useNavigate()
    const previewRef=useRef()
    useEffect(()=>{
        const style=document.createElement("style")
        style.textContent=TICKET_STYLES
        document.head.appendChild(style)
        return()=>{document.head.removeChild(style)}
    },[])
    const qrPreviewActive=useRef(false)
    const[showDeleteModal,setShowDeleteModal]=useState(false)
    useEffect(()=>{
        const handleKeyDown=e=>{
            if(qrPreviewActive.current&&(e.key==="Delete"||e.key==="Backspace")&&state.selectedElement>=0){
                setShowDeleteModal(true)
            }
        }
        window.addEventListener("keydown",handleKeyDown)
        return()=>{window.removeEventListener("keydown",handleKeyDown)}
    },[state.selectedElement])
    const handleConfirmDelete=()=>{
        dispatch({type:"DELETE_ELEMENT"})
        setShowDeleteModal(false)
    }
    const handleCancelDelete=()=>{
        setShowDeleteModal(false)
    }
    const handlePrint=useCallback(()=>{
        if(!previewRef.current)return
        const printContents=previewRef.current.innerHTML
        const printWindow=window.open("","_blank","width=800,height=600")
        printWindow.document.write(
            `<html><head><title>Imprimer</title><style>@page { margin:0; }body { margin:0; }</style></head>
      <body>${printContents}</body></html>`
        )
        printWindow.document.close()
        printWindow.focus()
        setTimeout(()=>{
            printWindow.print()
            printWindow.close()
        },100)
    },[])
    const handleDelete=useCallback(()=>{
        dispatch({type:"DELETE_ELEMENT"})
    },[dispatch])
    const handleDuplicate=()=>{
        if(!state.elements[state.selectedElement])return
        const elementToDuplicate={
            ...state.elements[state.selectedElement],
            x:state.elements[state.selectedElement].x+20,
            y:state.elements[state.selectedElement].y+20
        }
        dispatch({type:"SET_ELEMENTS",payload:[...state.elements,elementToDuplicate]})
    }
    const clampPosition=(pos,element)=>{
        let x=pos.x
        let y=pos.y
        const parentWidth=700
        const parentHeight=480
        const elWidthPx=element.width*37.8
        const elHeightPx=element.height*37.8
        if(x<0)x=0
        if(y<0)y=0
        if(x+elWidthPx>parentWidth)x=parentWidth-elWidthPx
        if(y+elHeightPx>parentHeight)y=parentHeight-elHeightPx
        return{x,y}
    }
    const addElement=(type,format="CODE128")=>{
        const newElement={
            type,
            content:"",
            value:"",
            format,
            x:20,
            y:20,
            fontSize:24,
            width:4,
            height:2,
            attributes:[]
        }
        dispatch({type:"SET_ELEMENTS",payload:[...state.elements,newElement]})
    }
    return(
        <>
            <div className="products-container" style={{marginBottom:"20px"}}>
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col md={3}>
                            <Form.Group>
                                <InputGroup className="printer-v2-search-input">
                                    <InputGroup.Text className="icon-prod-v2">Printer</InputGroup.Text>
                                    <Dropdown>
                                        <Dropdown.Toggle className="printer-v2-dropdown">Choisis un dossier</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>Action</Dropdown.Item>
                                            <Dropdown.Item>Another action</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button" onClick={handlePrint}>
                <span className="d-flex align-items-center">
                  <FaPrint style={{marginRight:"5px"}}/> Imprimer
                </span>
                            </Button>
                            <Button className="action-button" onClick={()=>navigate("/Printer")}>
                <span className="d-flex align-items-center">
                  <FaRedo style={{marginRight:"5px"}}/> Retour
                </span>
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="configuration-Qr">
                <div className="qr-maker-container" style={{display:"flex",gap:"10px"}}>
                    <div className="qr-tools" style={{minWidth:"150px"}}>
                        <Button
                            className="qr-tool-button mb-2"
                            onMouseDown={()=>{
                                dispatch({
                                    type:"SET_ELEMENTS",
                                    payload:[...state.elements,{
                                        type:"text",
                                        content:"Nouveau texte",
                                        x:20,y:20,
                                        fontSize:20,
                                        width:6,
                                        height:4,
                                        attributes:[]
                                    }]
                                })
                            }}
                        >
                            Ajouter Texte
                        </Button>
                        <Button className="qr-tool-button mb-2" onMouseDown={handleDuplicate}>Dupliquer</Button>
                        <Button className="qr-tool-button mb-2" onMouseDown={handleDelete}>Supprimer</Button>
                        {state.elements.length===0&&(
                            <Dropdown className="code-barres-print">
                                <Dropdown.Toggle className="code-print-buttons">Ajouter un code</Dropdown.Toggle>
                                <Dropdown.Menu className="code-print-dropdown">
                                    <Dropdown.Item onMouseDown={()=>addElement("qr")}>QR Code</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","CODE128")}>Code 128</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","EAN13")}>EAN13</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","MSI")}>MSI</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","CODE39")}>Code 39</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","CODE93")}>Code 93</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","UPC")}>UPC</Dropdown.Item>
                                    <Dropdown.Item onMouseDown={()=>addElement("barcode","EAN8")}>EAN8</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                        <Button className="qr-tool-button mb-2" onMouseDown={handleDuplicate}>Sauvegarder le modele</Button>
                        <div className="qr-edit-field">
                            <div className="dynamic-attributes-container mb-3">
                                <div className="attributes-header">
                                    <label>Attributs ({state.elements[state.selectedElement]?.attributes?.length||0}/3):</label>
                                </div>
                                <div className="dynamic-attributes-grid" style={{marginTop:"10px"}}>
                                    {DYNAMIC_ATTRIBUTES.filter(a=>a.category===state.itemType).map((attr,index)=>{
                                        const isSelected=state.elements[state.selectedElement]?.attributes?.some(x=>x.value===attr.value)
                                        return(
                                            <button
                                                key={index}
                                                className={`attribute-button ${isSelected?"selected":""}`.trim()}
                                                style={{
                                                    marginRight:"5px",
                                                    marginBottom:"5px",
                                                    padding:"6px",
                                                    cursor:"pointer",
                                                    backgroundColor:isSelected?"#007bff":"#f0f0f0",
                                                    color:isSelected?"#fff":"#000",
                                                    border:"none",
                                                    borderRadius:"4px"
                                                }}
                                                onMouseDown={()=>{
                                                    const element=state.elements[state.selectedElement]
                                                    if(!element)return
                                                    const updatedElements=[...state.elements]
                                                    const currentAttrs=element.attributes||[]
                                                    if(isSelected){
                                                        element.attributes=currentAttrs.filter(v=>v.value!==attr.value)
                                                    }else if(currentAttrs.length<3){
                                                        element.attributes=[...currentAttrs,attr]
                                                    }
                                                    dispatch({type:"SET_ELEMENTS",payload:updatedElements})
                                                }}
                                            >
                                                {attr.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="content-input mb-3">
                                <label>Width:</label>
                                <input
                                    style={{marginLeft:"10px",width:"95%",marginBottom:"5px"}}
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="10"
                                    value={Number((state.elements[state.selectedElement]?.width||0).toFixed(1))}
                                    onChange={e=>{
                                        const val=Math.min(Math.max(parseFloat(e.target.value)||0,1),10)
                                        const updated=[...state.elements]
                                        updated[state.selectedElement].width=val
                                        dispatch({type:"SET_ELEMENTS",payload:updated})
                                    }}
                                />
                                <label>Height:</label>
                                <input
                                    style={{marginLeft:"10px",width:"95%",marginBottom:"5px"}}
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="7"
                                    value={Number((state.elements[state.selectedElement]?.height||0).toFixed(1))}
                                    onChange={e=>{
                                        const val=Math.min(Math.max(parseFloat(e.target.value)||0,1),7)
                                        const updated=[...state.elements]
                                        updated[state.selectedElement].height=val
                                        dispatch({type:"SET_ELEMENTS",payload:updated})
                                    }}
                                />
                                <label>Contenu:</label>
                                <input
                                    type="text"
                                    style={{marginLeft:"10px",width:"95%",marginBottom:"5px"}}
                                    value={state.elements[state.selectedElement]?.content||state.elements[state.selectedElement]?.value||""}
                                    onChange={e=>{
                                        const updatedElements=[...state.elements]
                                        const selectedElement=updatedElements[state.selectedElement]
                                        if(selectedElement){
                                            const key=selectedElement.type==="text"?"content":"value"
                                            if(e.target.value===""){
                                                selectedElement[key]=null
                                            }else{
                                                selectedElement[key]=e.target.value
                                            }
                                            dispatch({type:"SET_ELEMENTS",payload:updatedElements})
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="qr-preview"
                        ref={previewRef}
                        tabIndex="0"
                        onMouseDown={()=>qrPreviewActive.current=true}
                        onBlur={()=>qrPreviewActive.current=false}
                        style={{
                            width:"700px",
                            height:"510px",
                            border:"1px solid #ccc",
                            position:"relative",
                            backgroundColor:"white",
                            marginTop:"0"
                        }}
                    >
                        {state.elements.map((element,index)=>(
                            <Rnd
                                key={index}
                                className={`draggable-element ${state.selectedElement===index?"selected":""}`}
                                bounds="parent"
                                size={{
                                    width:element.width*37.8,
                                    height:element.height*37.8
                                }}
                                position={{x:element.x,y:element.y}}
                                onDrag={(e,d)=>{
                                    const updated=[...state.elements]
                                    const clamped=clampPosition({x:d.x,y:d.y},element)
                                    updated[index]={...element,x:clamped.x,y:clamped.y}
                                    dispatch({type:"SET_ELEMENTS",payload:updated})
                                }}
                                onDragStop={(e,d)=>{
                                    dispatch({type:"SET_SELECTED",payload:index})
                                }}
                                enableResizing={{right:true,bottom:true,bottomRight:true}}
                                onResize={(e,direction,ref,delta,position)=>{
                                    const updated=[...state.elements]
                                    const w=ref.offsetWidth/37.8
                                    const h=ref.offsetHeight/37.8
                                    const clampPos=clampPosition(position,{...element,width:w,height:h})
                                    updated[index]={...element,width:w,height:h,x:clampPos.x,y:clampPos.y}
                                    dispatch({type:"SET_ELEMENTS",payload:updated})
                                }}
                                onResizeStop={(e,direction,ref,delta,position)=>{
                                    dispatch({type:"SET_SELECTED",payload:index})
                                }}
                            >
                                <div style={{width:"100%",height:"100%"}}>
                                    {element.type==="text"?
                                        <TextElement content={element.content} fontSize={element.fontSize}/>:
                                        <BarcodeOrQR
                                            type={element.type}
                                            value={element.value}
                                            width={element.width}
                                            height={element.height}
                                            format={element.format}
                                            attributes={element.attributes}
                                        />
                                    }
                                </div>
                            </Rnd>
                        ))}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                show={showDeleteModal}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cet élément ?"
            />
        </>
    )
}
