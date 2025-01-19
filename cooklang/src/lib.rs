use cooklang::error::SourceReport;
use cooklang::Extensions;
use cooklang::{Converter, CooklangParser};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Parser {
    parser: CooklangParser,
}

#[wasm_bindgen]
impl Parser {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let extensions = Extensions::COMPONENT_MODIFIERS
            .intersection(Extensions::COMPONENT_ALIAS)
            .intersection(Extensions::ADVANCED_UNITS)
            .intersection(Extensions::TIMER_REQUIRES_TIME);

        Self {
            parser: CooklangParser::new(extensions, Converter::bundled()),
        }
    }

    pub fn parse(&self, input: &str) -> FallibleResult {
        let (recipe, report) = self.parser.parse(input).into_tuple();
        let value = match recipe {
            Some(r) => serde_json::to_string(&r).unwrap(),
            None => "{\"error\": true}".to_string(),
        };
        FallibleResult::new(value, report, input)
    }
}

#[wasm_bindgen(getter_with_clone)]
pub struct FallibleResult {
    pub value: String,
    pub error: String,
}

impl FallibleResult {
    pub fn new(value: String, report: SourceReport, input: &str) -> Self {
        let mut buf = Vec::new();
        report
            .write("cooklang-wasm", input, false, &mut buf)
            .unwrap();
        let error = String::from_utf8_lossy(&buf).to_string();
        FallibleResult { value, error }
    }
}
