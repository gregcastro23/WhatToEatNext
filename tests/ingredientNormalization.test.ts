import { normalize, singularize, normalizedVariants, canonicalizeCoverageName, inferCategory } from "../src/utils/ingredientNormalization";

describe("ingredientNormalization", () => {
    it("normalizes text deterministically", () => {
        expect(normalize("Fresh Apple ")).toBe("fresh apple");
        expect(normalize("Jalapeño")).toBe("jalapeno");
    });

    it("singularizes tokens correctly", () => {
        expect(singularize("apples")).toBe("apple");
        expect(singularize("berries")).toBe("berry");
        expect(singularize("potatoes")).toBe("potato");
        expect(singularize("oil")).toBe("oil");
    });

    it("produces stable variants ignoring strict stopwords", () => {
        const variants = normalizedVariants("raw honey", true);
        expect(variants.has("honey")).toBe(true);
        // the word raw might be dropped leaving just honey
    });

    it("canonicalizes noisy recipe names", () => {
        expect(canonicalizeCoverageName("warm     chicken   ")).toBe("chicken");
    });

    it("infers categories fallback rigidly", () => {
        expect(inferCategory("chicken breast")).toBe("protein");
        expect(inferCategory("kale")).toBe("vegetable");
        expect(inferCategory("some unknown thing")).toBe("misc");
    });
});
