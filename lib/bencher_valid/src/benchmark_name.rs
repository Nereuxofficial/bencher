use derive_more::Display;
#[cfg(feature = "schema")]
use schemars::JsonSchema;
use std::{fmt, str::FromStr};
#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

use serde::{
    de::{self, Visitor},
    Deserialize, Deserializer, Serialize,
};

use crate::ValidError;

#[derive(Debug, Display, Clone, Eq, PartialEq, Hash, Serialize, Default)]
#[cfg_attr(feature = "schema", derive(JsonSchema))]
pub struct BenchmarkName(String);

impl FromStr for BenchmarkName {
    type Err = ValidError;

    fn from_str(benchmark_name: &str) -> Result<Self, Self::Err> {
        if is_valid_benchmark_name(benchmark_name) {
            Ok(Self(benchmark_name.into()))
        } else {
            Err(ValidError::BenchmarkName(benchmark_name.into()))
        }
    }
}

impl AsRef<str> for BenchmarkName {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl From<BenchmarkName> for String {
    fn from(benchmark_name: BenchmarkName) -> Self {
        benchmark_name.0
    }
}

impl<'de> Deserialize<'de> for BenchmarkName {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_str(BenchmarkNameVisitor)
    }
}

struct BenchmarkNameVisitor;

impl<'de> Visitor<'de> for BenchmarkNameVisitor {
    type Value = BenchmarkName;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a non-empty string")
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        value.parse().map_err(E::custom)
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn is_valid_benchmark_name(benchmark_name: &str) -> bool {
    !benchmark_name.is_empty()
}

#[cfg(test)]
mod test {
    use super::is_valid_benchmark_name;
    use pretty_assertions::assert_eq;

    #[test]
    fn test_benchmark_name() {
        assert_eq!(true, is_valid_benchmark_name("a"));
        assert_eq!(true, is_valid_benchmark_name("ab"));
        assert_eq!(true, is_valid_benchmark_name("abc"));
        assert_eq!(true, is_valid_benchmark_name("ABC"));
        assert_eq!(true, is_valid_benchmark_name("abc ~ABC!"));

        assert_eq!(false, is_valid_benchmark_name(""));
    }
}