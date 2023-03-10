import React, { useState, useEffect } from "react";
import { Alert, Checkbox, Input, Col, Row } from "antd";
import { useInfo } from "../store";
import axios from "axios";

const ButtonContainerArea = () => {
  const { carinfo, changeCarInfo, areainfo, changeAreaInfo } = useInfo();
  const [origin, setOrigin] = useState(false);
  const [protect, setProtect] = useState(false);
  const [quarantine, setQuarantine] = useState(true);
  const [wildAnimal, setWildAnimal] = useState(false);
  const [area, setArea] = useState("");
  const [pointName, setPointName] = useState("");
  const [dContent, setDContent] = useState("");
  useEffect(() => {
    axios
      .get(`http://localhost:4000/settingitems?Name=DeliverProof`)
      .then((response) => {
        let data = response.data[0].Value;
        data = data.replaceAll("`", '"');
        let parsedValue = JSON.parse(data);
        setArea(parsedValue?.Area);
        setPointName(parsedValue?.PointName);
        setDContent(parsedValue?.DContent);
        changeAreaInfo(parsedValue);
      });
  }, []);
  const onChangeOrigin = (e) => {
    setOrigin(true);
    setProtect(false);
    setQuarantine(false);
    setWildAnimal(false);
  };
  const onChangeProtect = (e) => {
    setOrigin(false);
    setProtect(true);
    setQuarantine(false);
    setWildAnimal(false);
  };
  const onChangeQuarantine = (e) => {
    setOrigin(false);
    setProtect(false);
    setQuarantine(true);
    setWildAnimal(false);
  };
  const onChangeWildAnimal = (e) => {
    setOrigin(false);
    setProtect(false);
    setQuarantine(false);
    setWildAnimal(true);
  };

  const onChangeArea = (e) => {
    setArea(e.target.value);
    changeAreaInfo({ ...areainfo, Area: e.target.value });
    changeCarInfo({ ...carinfo, Area: e.target.value });
  };
  const onChangePointName = (e) => {
    setPointName(e.target.value);
    changeAreaInfo({ ...areainfo, PointName: e.target.value });
    changeCarInfo({ ...carinfo, PointName: e.target.value });
  };
  const onChangeDContent = (e) => {
    setDContent(e.target.value);
    changeAreaInfo({ ...areainfo, DContent: e.target.value });
    changeCarInfo({ ...carinfo, DContent: e.target.value });
  };
  return (
    <div>
      <Checkbox checked={origin} onChange={onChangeOrigin}>
        ?????????
      </Checkbox>
      <Checkbox checked={protect} onChange={onChangeProtect}>
        ????????????
      </Checkbox>
      <Checkbox checked={quarantine} onChange={onChangeQuarantine}>
        ????????????
      </Checkbox>
      <Checkbox checked={wildAnimal} onChange={onChangeWildAnimal}>
        ???????????????????????????
      </Checkbox>
      <Input
        className="input"
        placeholder="?????? ??????"
        value={area}
        onChange={onChangeArea}
      />
      <Input
        className="input"
        placeholder="?????? ?????????"
        value={pointName}
        onChange={onChangePointName}
      />
      <Input
        className="input"
        placeholder="?????? ??????"
        value={dContent}
        onChange={onChangeDContent}
      />
    </div>
  );
};

export default ButtonContainerArea;
