import feather, { type FeatherAttributes } from "feather-icons";

function iconSvg(icon: any, attr?: FeatherAttributes) {
    return feather.icons[icon].toSvg(attr)
}

export { iconSvg }