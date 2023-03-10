import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { Col, Row, Button, Layout, Modal, message } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import axios from 'axios';
import Container from './components/Container';
import WaitingContainer from './components/WaitingContainer';
import CarinfoContainer from './components/CarinfoContainer';
import IpChange from './components/IpChange';
import gifImg from './image/disinfection.gif';
import Breaker1 from './image/Breaker1.gif';
import Water2 from './image/Water2.gif';
import Move3 from './image/Move3.gif';
import Disinfect4 from './image/Disinfect4.gif';
import Out5 from './image/Out5.gif';
import PrintInfo from './components/PrintInfo';
import AutoSwitch from './components/AutoSwitch';
import * as mqtt from 'mqtt/dist/mqtt.min';
import WaitingCar from './components/WaitingCar';
import InquireAll from './components/InquireAll';
import ReactToPrint from 'react-to-print';
import arrivesound from './mp3/carArrived.mp3';
import notrecogsound from './mp3/carNotRecog.mp3';
import ReactDOM from 'react-dom/client';
import PrintCompleted from './components/PrintCompleted';
import Alarm from './components/Alarm';
import moment from 'moment';
import imageToBase64 from 'image-to-base64/browser';

import { useMqtt, useInfo, useWaitingCar } from './store';
import { WindowsFilled } from '@ant-design/icons';
export let client = null;

function App() {
  // const {client,changeClient,connectstatus,changeConnectStatus,payload, }
  // const [client, setClient] = useState(null);
  const [connectstatus, setConnectStatus] = useState('');
  const [payload, setPayload] = useState([]);
  const [isModalOpenPrint, setIsModalOpenPrint] = useState(false);
  const [isModalOpenFind, setIsModalOpenFind] = useState(false);
  const [dbImgUrl, setDbImgUrl] = useState('');
  const {
    waitingcarimg,
    changeWaitingCarImg,
    changePrintedCar,
    waitingcar,
    printedcar,
    waitingcurrentnumber,
    carinfo,
    actorinfo,
    checkerinfo,
    areainfo,
    deletewaitingcar,
    changeWaitingCar,
    changeCarInfoData,
    carinfodata,
    changeWaitingCurrentNumber,
  } = useInfo();
  const { trashwaitingcar, changeTrashWaitingCar } = useWaitingCar();
  const [carimg, setCarImg] = useState('');
  const options = {
    keepalive: 3000,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 10 * 60 * 1000,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false,
    },
    rejectUnauthorized: false,
  };
  // let carImg = null;
  let imgurl = '';
  var str = 'TIME20221201113500';
  let bytes = []; // char codes
  var bytesv2 = []; // char codes
  for (var i = 0; i < str.length; ++i) {
    var code = str.charCodeAt(i);

    bytes = bytes.concat([code]);

    bytesv2 = bytesv2.concat([code & 0xff, (code / 256) >>> 0]);
  }
  bytes.unshift(2);
  bytes.push(3);

  const mqttConnect = (host, options) => {
    setConnectStatus('Connecting');
    client = mqtt.connect(host, options);
  };
  useEffect(() => {
    if (!client) {
      mqttConnect('ws://' + window.location.hostname + ':9001', options);
    }
    if (client) {
      client?.on('connect', () => {
        setConnectStatus('Connected');
      });
      client?.subscribe('#', 0, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error);
          return;
        }
      });
      client?.on('error', (err) => {
        console.error('Connection error: ', err);
        client?.end();
      });
      client?.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });
      client?.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() };
        if (topic.includes('CCTV')) {
          message = message.toString().replaceAll('\\', '/');
          // .replaceAll('"', "'");
          let msg = JSON.parse(message?.toString());

          if (msg?.CARNUMBER === '?????????') {
            try {
              const audio = new Audio(notrecogsound);
              audio.play();
            } catch (error) {
              console.log('error', error);
            }
          } else if (msg?.CMD !== 'CCTVISOK') {
            try {
              const audio = new Audio(arrivesound);
              audio.play();
            } catch (error) {
              console.log('error', error);
            }
            imgurl = msg?.IMG;

            imgurl = imgurl?.replace('c:/LPR', 'http://127.0.0.1:4000/images');
            imageToBase64(`${imgurl}`) // Image URL
              .then((response) => {
                setDbImgUrl(response);
                // console.log(response); // "iVBORw0KGgoAAAANSwCAIA..."
              })
              .catch((error) => {
                console.log(error); // Logs an error if there was one
              });
            changeWaitingCarImg(imgurl);
          }
        }
        if (topic.includes('CarCleanDeviceRequest')) {
          const msg = message.toString();
          const jsonMsg = JSON.parse(msg);
          if (jsonMsg?.CMD === 'BREAKER') {
            gifImg = Breaker1;
          }
          if (jsonMsg?.CMD === 'REMOVE_WATER') {
            gifImg = Water2;
          }
          if (jsonMsg?.CMD === 'CLEAN_DRIVER') {
            gifImg = Move3;
          }
          if (jsonMsg?.CMD === 'AIR_DEODORIZATION') {
            gifImg = Disinfect4;
          }
          if (jsonMsg?.CMD === 'OUT_GATE') {
            gifImg = Out5;
          }
        }
        setPayload(payload);
      });
      client?.on('disconnect', () => client.end());
    }
  }, []);

  const showModalPrint = () => {
    setIsModalOpenPrint(true);
  };
  const handleOkPrint = (e) => {
    setIsModalOpenPrint(false);
  };
  const handleCancelPrint = () => {
    setIsModalOpenPrint(false);
  };
  const showModalFind = () => {
    setIsModalOpenFind(true);
  };
  const handleOkFind = (e) => {
    setIsModalOpenFind(false);
  };
  const handleCancelFind = () => {
    setIsModalOpenFind(false);
  };
  const onPrintedCar = () => {
    let crTime = moment().format('YYYYMMDDHHmmss');
    let arr = printedcar;
    arr.unshift({ Number: carinfo?.Number, PrintIndex: crTime });
    if (arr.length > 10) {
      arr.pop();
    }
    let rt1 = false;

    changePrintedCar(arr);
    axios
      .post('http://localhost:4000/carinfoitems', {
        PrintIndex: crTime,
        Number: `${carinfo?.Number === undefined ? '' : carinfo?.Number}`,
        Address: `${carinfo?.Address}`,
        RegNumber: `${carinfo?.RegNumber}`,
        Phone: `${carinfo?.Phone}`,
        GpsNumber: `${carinfo?.GpsNumber}`,
        Owner: `${carinfo?.Owner}`,
        SPoint: `${carinfo?.SPoint}`,
        Purpose: `${carinfo?.Purpose}`,
        EPoint: `${carinfo?.EPoint}`,
        EAttached: `${actorinfo?.Attached}`,
        EName: `${actorinfo?.Name}`,
        EPhone: `${actorinfo?.Phone}`,
        EPosition: `${actorinfo?.Position}`,
        CAttached: `${checkerinfo?.Attached}`,
        CName: `${checkerinfo?.Name}`,
        CPhone: `${checkerinfo?.Phone}`,
        CPosition: `${checkerinfo?.Position}`,
        Area: `${areainfo?.Area}`,
        AreaType: `${areainfo?.AreaType}`,
        DContent: `${areainfo?.DContent}`,
        PointName: `${areainfo?.PointName}`,
        ImagePath: `${dbImgUrl}`,
      })
      .then((res) => {
        console.log('res :>> ', res);
        if (res.statusText === 'OK') {
          rt1 = true;
          Modal.success({
            content: `?????? ??????!`,
          });
        } else {
          rt1 = false;
          Modal.error({
            content: `?????? ??????!`,
          });
        }
      });

    axios.get('http://localhost:4000/settingitemsConfig').then((res) => {
      let data = res.data[0].Value;
      data = data.replaceAll('`', '"');
      let parsedValue = JSON.parse(data);
      // console.log('dataparsed :>> ', parsedValue.WEPURL);
      console.log('111111 :>> ', 111111);

      // let URL = parsedValue.WEPURL.replace('/disinfect.post.php', '');

      axios
        .post(`http://localhost:4000/websend`, {
          PrintIndex: crTime,
          Number: `${carinfo?.Number}`,
          Address: `${carinfo?.Address}`,
          RegNumber: `${carinfo?.RegNumber}`,
          Phone: `${carinfo?.Phone}`,
          GpsNumber: `${carinfo?.GpsNumber}`,
          Owner: `${carinfo?.Owner}`,
          SPoint: `${carinfo?.SPoint}`,
          Purpose: `${carinfo?.Purpose}`,
          EPoint: `${carinfo?.EPoint}`,
          EAttached: `${actorinfo?.Attached}`,
          EName: `${actorinfo?.Name}`,
          EPhone: `${actorinfo?.Phone}`,
          EPosition: `${actorinfo?.Position}`,
          CAttached: `${checkerinfo?.Attached}`,
          CName: `${checkerinfo?.Name}`,
          CPhone: `${checkerinfo?.Phone}`,
          CPosition: `${checkerinfo?.Position}`,
          Area: `${areainfo?.Area}`,
          AreaType: `${areainfo?.AreaType}`,
          DContent: `${areainfo?.DContent}`,
          PointName: `${areainfo?.PointName}`,
          Image: `${dbImgUrl}`,
          RegistryDate: `${carinfo?.RegistryDate}`,
        })
        .then((res) => {
          console.log('111111 :>> ', 111111);
          console.log('res', res);
        });
    });
  };
  const printFunc = () => {
    if (carinfo?.Number === '' || carinfo?.Number === undefined) {
      message.error('??? ????????? ??????????????????');
      return;
    }

    onPrintedCar();
    let arr = [];
    let arr2 = [];
    arr = trashwaitingcar;
    arr.map((item, idx) =>
      item !== waitingcurrentnumber ? arr2.push(item) : null
    );
    changeTrashWaitingCar(arr2);
    changeCarInfoData({ ...carinfodata, Number: trashwaitingcar[0].Number });
    changeWaitingCar(trashwaitingcar);
    changeWaitingCurrentNumber(arr2[0]);

    let printContents = componentRef.current.innerHTML;
    let windowObject = window.open(
      '',
      'PrintWindow',
      'width=1000, height=1000, top=200, lefg=200, tollbars=no, scrollbars=no, resizeable=no'
    );

    windowObject.document.writeln(printContents);
    windowObject.document.close();

    windowObject.focus();
    let aa = windowObject.print();
    console.log('aa :>> ', aa);
    windowObject.close();
    waitingcar.shift();
    console.log('waitingcar', waitingcar);
  };
  const componentRef = useRef(null);

  return (
    <>
      <Row>
        <Col>
          <Button onClick={showModalFind}>??????</Button>
          <Modal
            style={{ height: '60vh' }}
            bodyStyle={{ overflowX: 'auto', overflowY: 'auto' }}
            width='700'
            open={isModalOpenFind}
            onOk={handleOkFind}
            onCancel={handleCancelFind}
            footer={[
              <Button key='submit' type='primary' onClick={handleOkFind}>
                ??????
              </Button>,
            ]}
          >
            <InquireAll />
          </Modal>
        </Col>
        <Col>
          <IpChange />
        </Col>
      </Row>

      <Row
        wrap={false}
        style={{ height: '100vh', overflow: 'hidden' }}
        gutter={(8, 8)}
      >
        <Col style={{ width: '300px' }} flex={2}>
          <Container title={'????????????'}>
            <Button onClick={printFunc}>??????</Button>
            {/* <ReactToPrint
              handleClick={() => {
                console.log("first");
              }}
              trigger={() => {
                return (
                  <Button
                    onClick={() => {
                      console.log("first");
                    }}
                  >
                    ??????
                  </Button>
                );
              }}
              content={() => componentRef.current}
            /> */}
            <PrintInfo className='printarea' printRef={componentRef} />
          </Container>
        </Col>

        <Col flex={8}>
          <Col style={{ height: '425px' }}>
            <Row gutter={(8, 8)}>
              <Container span={6} title={'????????????'}>
                <CarinfoContainer></CarinfoContainer>
              </Container>
              <WaitingContainer span={5} title={'????????????'}>
                <WaitingCar />
              </WaitingContainer>
              <Container span={5} title={'?????????????????????'}>
                <PrintCompleted />
              </Container>
              <Container span={8} title={'??????'}>
                <Alarm />
              </Container>
            </Row>
          </Col>
          <Col>
            <AutoSwitch title={'????????????'}>
              <img style={{ width: '99%', height: '50vh' }} src={gifImg} />
            </AutoSwitch>
          </Col>
        </Col>
      </Row>
    </>
  );
}

export default App;
