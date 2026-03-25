import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import {
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { useAuth } from "../src/context/AuthContext";
import {
  createQuoteInquiry,
  isInquiriesTableMissingError,
  QuoteInquiryPayload,
} from "../src/api/inquiryApi";
import { getAllNavMenuItems } from "../src/api/cmsApi";
import {
  sendQuoteInquiryFallbackEmail,
  sendQuoteInquiryNotificationEmail,
} from "../src/utils/email";

type CategoryGroup = {
  parentName: string;
  children: string[];
};

const TEXT = {
  pageTitle: "\uACAC\uC801\uBB38\uC758\uC11C | \uD734\uBA3C\uD30C\uD2B8\uB108",
  pageDescription:
    "\uC5C5\uCCB4\uBA85, \uB2F4\uB2F9\uC790 \uC815\uBCF4, \uD544\uC694 \uD488\uBAA9\uACFC \uC77C\uC815\uC744 \uB0A8\uAE30\uBA74 \uD734\uBA3C\uD30C\uD2B8\uB108\uAC00 \uB9DE\uCDA4 \uACAC\uC801\uC744 \uC548\uB0B4\uD574\uB4DC\uB9BD\uB2C8\uB2E4.",
  eyebrow: "ESTIMATE REQUEST",
  heroTitle: "\uAE30\uC5C5 \uB80C\uD0C8 \uACAC\uC801\uBB38\uC758",
  heroDescription:
    "\uD544\uC694\uD55C \uD488\uBAA9\uACFC \uC77C\uC815, \uC124\uCE58 \uC870\uAC74\uC744 \uB0A8\uACA8 \uC8FC\uC2DC\uBA74 \uD655\uC778 \uD6C4 \uBE60\uB974\uACE0 \uC815\uD655\uD55C \uACAC\uC801\uC744 \uC548\uB0B4\uD574\uB4DC\uB9BD\uB2C8\uB2E4.",
  successTitle: "\uACAC\uC801\uBB38\uC758\uAC00 \uC815\uC0C1 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  successDescription:
    "\uC785\uB825\uD574 \uC8FC\uC2E0 \uB0B4\uC6A9\uC744 \uD655\uC778\uD55C \uB4A4 \uB2F4\uB2F9\uC790\uAC00 \uC21C\uCC28\uC801\uC73C\uB85C \uC548\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.",
  resetButton: "\uC0C8 \uACAC\uC801\uBB38\uC758 \uC791\uC131\uD558\uAE30",
  companyName: "\uC5C5\uCCB4\uBA85",
  contactName: "\uB2F4\uB2F9\uC790\uBA85",
  phone: "\uC5F0\uB77D\uCC98",
  email: "\uC774\uBA54\uC77C",
  products: "\uD544\uC694 \uD488\uBAA9",
  rentalStart: "\uB80C\uD0C8 \uC2DC\uC791\uC77C",
  rentalEnd: "\uB80C\uD0C8 \uC885\uB8CC\uC77C",
  quantity: "\uC608\uC0C1 \uC218\uB7C9",
  budget: "\uC608\uC0B0 \uBC94\uC704",
  location: "\uC124\uCE58 / \uD68C\uC218 \uC7A5\uC18C",
  preferredInstallTime: "\uC124\uCE58 \uD76C\uB9DD \uC2DC\uAC04",
  preferredPickupTime: "\uD68C\uC218 \uD76C\uB9DD \uC2DC\uAC04",
  paymentMethod: "\uACB0\uC81C\uBC29\uBC95",
  notes: "\uC694\uCCAD \uB0B4\uC6A9",
  submit: "\uACAC\uC801\uBB38\uC758 \uC811\uC218\uD558\uAE30",
  submitting: "\uC811\uC218 \uC911...",
  companyPlaceholder: "\uC5C5\uCCB4\uBA85\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  contactPlaceholder: "\uB2F4\uB2F9\uC790\uBA85\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  phonePlaceholder: "010-1234-5678",
  emailPlaceholder: "example@company.com",
  quantityPlaceholder: "\uC608: \uC758\uC790 30\uAC1C, \uCC45\uC0C1 15\uAC1C",
  quantityItemPlaceholder: "\uC218\uB7C9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  locationPlaceholder: "\uC608: \uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C 00",
  preferredInstallTimePlaceholder: "\uC608: 3/28 09:00",
  preferredPickupTimePlaceholder: "\uC608: 3/31 18:00",
  paymentMethodPlaceholder: "\uACB0\uC81C\uBC29\uBC95\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  paymentMethodEtcPlaceholder: "\uAE30\uD0C0 \uACB0\uC81C\uBC29\uBC95\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  notesPlaceholder:
    "\uD544\uC694 \uD488\uBAA9, \uC0AC\uC6A9 \uBAA9\uC801, \uC6B4\uC601 \uAE30\uAC04, \uC124\uCE58 \uC870\uAC74, \uD2B9\uC774\uC0AC\uD56D \uB4F1\uC744 \uC790\uC720\uB86D\uAC8C \uC801\uC5B4 \uC8FC\uC138\uC694.",
  categoryPlaceholder: "\uD488\uBAA9 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  loadingCategories: "\uCE74\uD14C\uACE0\uB9AC\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.",
  categorySelectedSuffix: "\uAC1C \uD56D\uBAA9 \uC120\uD0DD\uB428",
  categoryClose: "\uC120\uD0DD \uC644\uB8CC",
  directInput: "\uC9C1\uC811 \uC785\uB825",
  etc: "\uAE30\uD0C0",
  etcDescription: "\uBAA9\uB85D\uC5D0 \uC5C6\uB294 \uD488\uBAA9",
  etcPlaceholder: "\uD544\uC694\uD55C \uD488\uBAA9\uC744 \uC9C1\uC811 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  requiredError:
    "\uC5C5\uCCB4\uBA85, \uB2F4\uB2F9\uC790\uBA85, \uC5F0\uB77D\uCC98, \uC774\uBA54\uC77C, \uD544\uC694 \uD488\uBAA9, \uB80C\uD0C8 \uC2DC\uC791\uC77C/\uC885\uB8CC\uC77C, \uC608\uC0B0 \uBC94\uC704, \uC124\uCE58 \uC7A5\uC18C, \uAC1C\uC778\uC815\uBCF4 \uB3D9\uC758\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.",
  productsError: "\uD544\uC694 \uD488\uBAA9\uC744 \uCD5C\uC18C 1\uAC1C \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
  quantityRequiredError: "\uC120\uD0DD\uD55C \uBAA8\uB4E0 \uD488\uBAA9\uC758 \uC608\uC0C1 \uC218\uB7C9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  etcError: "\uAE30\uD0C0 \uD488\uBAA9 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  paymentMethodEtcError: "\uAE30\uD0C0 \uACB0\uC81C\uBC29\uBC95 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  dateOrderError: "\uB80C\uD0C8 \uC885\uB8CC\uC77C\uC740 \uC2DC\uC791\uC77C\uBCF4\uB2E4 \uC55E\uC124 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  privacyConsent: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4.",
  privacyConsentError: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68 \uB3D9\uC758\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
  requiredGuide: "* \uD45C\uC2DC \uD56D\uBAA9\uC740 \uD544\uC218 \uC785\uB825\uC785\uB2C8\uB2E4.",
  submitError:
    "\uACAC\uC801\uBB38\uC758 \uC811\uC218\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
  fallbackError:
    "\uC628\uB77C\uC778 \uC811\uC218\uAC00 \uC5B4\uB824\uC6B4 \uC0C1\uD0DC\uC785\uB2C8\uB2E4. 1800-1985 \uB610\uB294 hm_solution@naver.com\uC73C\uB85C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.",
};

const BUDGET_OPTIONS = [
  "500\uB9CC\uC6D0 \uBBF8\uB9CC",
  "500\uB9CC\uC6D0 ~ 1,000\uB9CC\uC6D0",
  "1,000\uB9CC\uC6D0 ~ 3,000\uB9CC\uC6D0",
  "3,000\uB9CC\uC6D0 \uC774\uC0C1",
  "\uBBF8\uC815",
];

const PAYMENT_METHOD_OPTIONS = [
  "\uC804\uC790\uC138\uAE08\uACC4\uC0B0\uC11C",
  "\uD604\uC7A5\uCE74\uB4DC\uACB0\uC81C",
  "\uB098\uB77C\uBE4C / \uB098\uB77C\uC7A5\uD130",
  TEXT.etc,
];

const ETC_PRODUCT_LABEL = TEXT.etc;
const ETC_PAYMENT_METHOD_LABEL = TEXT.etc;

const initialForm: QuoteInquiryPayload = {
  companyName: "",
  contactName: "",
  phone: "",
  email: "",
  neededProducts: [],
  rentalStart: "",
  rentalEnd: "",
  quantity: "",
  budget: "",
  location: "",
  preferredInstallTime: "",
  preferredPickupTime: "",
  preferredInstallPickupTime: "",
  paymentMethod: "",
  notes: "",
};

const toLocalDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

const RequiredDot = () => <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500/85 align-middle" aria-hidden="true" />;

export const QuoteRequestPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<QuoteInquiryPayload>(initialForm);
  const [productQuantities, setProductQuantities] = useState<Record<string, string>>({});
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [etcProduct, setEtcProduct] = useState("");
  const [etcPaymentMethod, setEtcPaymentMethod] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName || userProfile?.company_name || "",
      contactName: prev.contactName || userProfile?.name || "",
      phone: prev.phone || userProfile?.phone || "",
      email: prev.email || userProfile?.email || user?.email || "",
    }));
  }, [user?.email, userProfile?.company_name, userProfile?.email, userProfile?.name, userProfile?.phone]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const navItems = await getAllNavMenuItems();
        const sorted = navItems
          .filter((item) => item.is_active !== false)
          .sort((a, b) => {
            const aOrder = typeof a.display_order === "number" ? a.display_order : 999;
            const bOrder = typeof b.display_order === "number" ? b.display_order : 999;
            return aOrder - bOrder;
          });

        const parentNames: string[] = [];
        const childMap: Record<string, string[]> = {};

        sorted.forEach((item) => {
          const name = item.name?.trim();
          const parent = item.category?.trim();
          if (!name) return;

          if (!parent) {
            if (!parentNames.includes(name)) parentNames.push(name);
            return;
          }

          if (!childMap[parent]) childMap[parent] = [];
          if (!childMap[parent].includes(name)) childMap[parent].push(name);
        });

        const groups = parentNames
          .filter((parentName) => childMap[parentName] && childMap[parentName].length > 0)
          .map((parentName) => ({ parentName, children: childMap[parentName] }));

        setCategoryGroups(groups);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoryGroups([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!showCategoryModal) return;

    const handleClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCategoryModal(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCategoryModal]);

  const getProductDisplayLabel = (item: string) =>
    item === ETC_PRODUCT_LABEL && etcProduct.trim() ? `${ETC_PRODUCT_LABEL}(${etcProduct.trim()})` : item;

  const toggleNeededProduct = (item: string) => {
    setFormData((prev) => {
      const exists = prev.neededProducts.includes(item);
      return {
        ...prev,
        neededProducts: exists
          ? prev.neededProducts.filter((target) => target !== item)
          : [...prev.neededProducts, item],
      };
    });

    setProductQuantities((prev) => {
      const next = { ...prev };
      if (item in next) {
        delete next[item];
        return next;
      }

      next[item] = "";
      return next;
    });

    if (item === ETC_PRODUCT_LABEL && formData.neededProducts.includes(item)) {
      setEtcProduct("");
    }
  };

  const selectedProductsSummary = useMemo(() => {
    return formData.neededProducts
      .map((item) => getProductDisplayLabel(item))
      .join(", ");
  }, [etcProduct, formData.neededProducts]);

  const quantitySummary = useMemo(() => {
    return formData.neededProducts
      .map((item) => {
        const quantity = productQuantities[item]?.trim();
        if (!quantity) return "";
        return `${getProductDisplayLabel(item)} ${quantity}`;
      })
      .filter(Boolean)
      .join(", ");
  }, [etcProduct, formData.neededProducts, productQuantities]);

  const handleRentalStartChange = (date: Date | null) => {
    const nextStart = toLocalDateInputValue(date);

    setFormData((prev) => {
      const shouldResetEnd =
        nextStart && prev.rentalEnd && new Date(prev.rentalEnd).getTime() < new Date(nextStart).getTime();

      return {
        ...prev,
        rentalStart: nextStart,
        rentalEnd: shouldResetEnd ? "" : prev.rentalEnd,
      };
    });
  };

  const handleRentalEndChange = (date: Date | null) => {
    const nextEnd = toLocalDateInputValue(date);

    setFormData((prev) => {
      if (nextEnd && prev.rentalStart && new Date(nextEnd).getTime() < new Date(prev.rentalStart).getTime()) {
        return prev;
      }

      return {
        ...prev,
        rentalEnd: nextEnd,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (
      !formData.companyName.trim() ||
      !formData.contactName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.rentalStart.trim() ||
      !formData.rentalEnd.trim() ||
      !formData.budget?.trim() ||
      !formData.location?.trim()
    ) {
      setErrorMessage(TEXT.requiredError);
      return;
    }

    if (formData.neededProducts.length === 0) {
      setErrorMessage(TEXT.productsError);
      return;
    }

    if (formData.neededProducts.some((item) => !productQuantities[item]?.trim())) {
      setErrorMessage(TEXT.quantityRequiredError);
      return;
    }

    if (formData.neededProducts.includes(ETC_PRODUCT_LABEL) && !etcProduct.trim()) {
      setErrorMessage(TEXT.etcError);
      return;
    }

    if (formData.paymentMethod === ETC_PAYMENT_METHOD_LABEL && !etcPaymentMethod.trim()) {
      setErrorMessage(TEXT.paymentMethodEtcError);
      return;
    }

    if (formData.rentalStart && formData.rentalEnd && new Date(formData.rentalEnd).getTime() < new Date(formData.rentalStart).getTime()) {
      setErrorMessage(TEXT.dateOrderError);
      return;
    }

    if (!privacyAgreed) {
      setErrorMessage(TEXT.privacyConsentError);
      return;
    }

    const payload: QuoteInquiryPayload = {
      ...formData,
      neededProducts: formData.neededProducts.map((item) => {
        const label = item === ETC_PRODUCT_LABEL ? `${ETC_PRODUCT_LABEL}(${etcProduct.trim()})` : item;
        const quantity = productQuantities[item]?.trim();
        return quantity ? `${label} (${quantity})` : label;
      }),
      paymentMethod:
        formData.paymentMethod === ETC_PAYMENT_METHOD_LABEL
          ? `${ETC_PAYMENT_METHOD_LABEL}(${etcPaymentMethod.trim()})`
          : formData.paymentMethod,
      preferredInstallPickupTime: `설치: ${formData.preferredInstallTime?.trim() || "-"}\n회수: ${formData.preferredPickupTime?.trim() || "-"}`,
      quantity: quantitySummary,
      notes: formData.notes.trim(),
    };

    setSubmitting(true);
    try {
      await createQuoteInquiry(payload, {
        userId: user?.uid,
        userName: userProfile?.name || payload.contactName,
        userEmail: userProfile?.email || payload.email,
      });

      try {
        await sendQuoteInquiryNotificationEmail(payload, {
          userId: user?.uid,
          userName: userProfile?.name || payload.contactName,
          userEmail: userProfile?.email || payload.email,
        });
      } catch (notificationError) {
        console.error("Quote inquiry notification email failed:", notificationError);
      }

      setSubmitted(true);
      setFormData(initialForm);
      setProductQuantities({});
      setEtcProduct("");
      setEtcPaymentMethod("");
      setPrivacyAgreed(false);
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to submit quote inquiry:", error);

      if (isInquiriesTableMissingError(error)) {
        try {
          await sendQuoteInquiryFallbackEmail(payload, {
            userId: user?.uid,
            userName: userProfile?.name || payload.contactName,
            userEmail: userProfile?.email || payload.email,
          });

          setSubmitted(true);
          setFormData(initialForm);
          setProductQuantities({});
          setEtcProduct("");
          setEtcPaymentMethod("");
          setPrivacyAgreed(false);
          setShowCategoryModal(false);
          return;
        } catch (fallbackError) {
          console.error("Quote inquiry email fallback failed:", fallbackError);
          setErrorMessage(TEXT.fallbackError);
          return;
        }
      }

      setErrorMessage(TEXT.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="bg-white py-16 md:py-24">
        <Helmet>
          <title>{TEXT.pageTitle}</title>
        </Helmet>
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center md:p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#001e45]/10 text-[#001e45]">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">{TEXT.successTitle}</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">{TEXT.successDescription}</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#001e45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#132f66]"
            >
              {TEXT.resetButton}
            </button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-white pb-20 pt-8 md:pt-12">
      <Helmet>
        <title>{TEXT.pageTitle}</title>
        <meta name="description" content={TEXT.pageDescription} />
      </Helmet>

      <Container>
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-8 md:px-10 md:py-12">
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#001e45]/80">{TEXT.eyebrow}</p>
          <h1 className="mt-3 break-keep text-[22px] font-extrabold tracking-tight text-slate-900 md:text-[40px] md:leading-[1.25]">
            {TEXT.heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">{TEXT.heroDescription}</p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <form className="space-y-7" onSubmit={handleSubmit}>
            <p className="text-sm font-medium text-slate-500">{TEXT.requiredGuide}</p>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Building2 size={16} className="text-[#001e45]" />
                  {TEXT.companyName}
                  <RequiredDot />
                </span>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyName: event.target.value }))}
                  placeholder={TEXT.companyPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <User size={16} className="text-[#001e45]" />
                  {TEXT.contactName}
                  <RequiredDot />
                </span>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, contactName: event.target.value }))}
                  placeholder={TEXT.contactPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={16} className="text-[#001e45]" />
                  {TEXT.phone}
                  <RequiredDot />
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder={TEXT.phonePlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Mail size={16} className="text-[#001e45]" />
                  {TEXT.email}
                  <RequiredDot />
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder={TEXT.emailPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Boxes size={16} className="text-[#001e45]" />
                {TEXT.products}
                <RequiredDot />
              </p>

              {formData.neededProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.neededProducts.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#001e45] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {item === ETC_PRODUCT_LABEL && etcProduct.trim() ? `${ETC_PRODUCT_LABEL}(${etcProduct.trim()})` : item}
                      <button
                        type="button"
                        onClick={() => toggleNeededProduct(item)}
                        className="rounded-full p-0.5 hover:bg-white/20"
                        aria-label={`${item} remove`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative" ref={modalRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 outline-none transition hover:border-slate-300 focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                >
                  {loadingCategories
                    ? TEXT.loadingCategories
                    : formData.neededProducts.length > 0
                      ? `${formData.neededProducts.length}${TEXT.categorySelectedSuffix}`
                      : TEXT.categoryPlaceholder}
                  <ChevronDown size={18} className={`transition-transform ${showCategoryModal ? "rotate-180" : ""}`} />
                </button>

                {showCategoryModal && !loadingCategories && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    {categoryGroups.length > 0 ? (
                      <div className="space-y-4">
                        {categoryGroups.map((group) => (
                          <div key={group.parentName}>
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#001e45]">
                              {group.parentName}
                            </p>
                            <div className="space-y-1">
                              {group.children.map((child) => {
                                const active = formData.neededProducts.includes(child);
                                return (
                                  <label
                                    key={child}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                      active ? "bg-[#001e45]/5 text-[#001e45]" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={active}
                                      onChange={() => toggleNeededProduct(child)}
                                      className="h-4 w-4 rounded border-slate-300 accent-[#001e45]"
                                    />
                                    {child}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <div>
                          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{TEXT.directInput}</p>
                          <label
                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                              formData.neededProducts.includes(ETC_PRODUCT_LABEL)
                                ? "bg-[#001e45]/5 text-[#001e45]"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.neededProducts.includes(ETC_PRODUCT_LABEL)}
                              onChange={() => toggleNeededProduct(ETC_PRODUCT_LABEL)}
                              className="h-4 w-4 rounded border-slate-300 accent-[#001e45]"
                            />
                            {TEXT.etc} ({TEXT.etcDescription})
                          </label>
                        </div>
                      </div>
                    ) : (
                      <p className="py-4 text-center text-sm text-slate-400">{TEXT.categoryPlaceholder}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(false)}
                      className="mt-4 w-full rounded-xl bg-[#001e45] py-2.5 text-sm font-bold text-white transition hover:bg-[#132f66]"
                    >
                      {TEXT.categoryClose}
                    </button>
                  </div>
                )}
              </div>

              {formData.neededProducts.includes(ETC_PRODUCT_LABEL) && (
                <input
                  type="text"
                  value={etcProduct}
                  onChange={(event) => setEtcProduct(event.target.value)}
                  placeholder={TEXT.etcPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              )}

              {selectedProductsSummary && <p className="text-sm text-slate-500">{selectedProductsSummary}</p>}

              {formData.neededProducts.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    {TEXT.quantity}
                    <RequiredDot />
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {formData.neededProducts.map((item) => (
                      <label key={`quantity-${item}`} className="space-y-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          {getProductDisplayLabel(item)}
                          <RequiredDot />
                        </span>
                        <input
                          type="text"
                          required
                          value={productQuantities[item] || ""}
                          onChange={(event) =>
                            setProductQuantities((prev) => ({
                              ...prev,
                              [item]: event.target.value,
                            }))
                          }
                          placeholder={TEXT.quantityItemPlaceholder}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <CalendarDays size={16} className="text-[#001e45]" />
                  {TEXT.rentalStart}
                  <RequiredDot />
                </span>
                <DatePicker
                  selected={formData.rentalStart ? new Date(formData.rentalStart) : null}
                  onChange={handleRentalStartChange}
                  dateFormat="yyyy-MM-dd"
                  locale={ko}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  minDate={new Date()}
                  maxDate={new Date(2030, 11, 31)}
                  placeholderText="시작일을 선택해 주세요."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <CalendarDays size={16} className="text-[#001e45]" />
                  {TEXT.rentalEnd}
                  <RequiredDot />
                </span>
                <DatePicker
                  selected={formData.rentalEnd ? new Date(formData.rentalEnd) : null}
                  onChange={handleRentalEndChange}
                  dateFormat="yyyy-MM-dd"
                  locale={ko}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  minDate={formData.rentalStart ? new Date(formData.rentalStart) : new Date()}
                  maxDate={new Date(2030, 11, 31)}
                  placeholderText="종료일을 선택해 주세요."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>
            </div>

            <label className="mt-2 block space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MapPin size={16} className="text-[#001e45]" />
                {TEXT.location}
                <RequiredDot />
              </span>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                placeholder={TEXT.locationPlaceholder}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-700">{TEXT.preferredInstallTime}</span>
                <input
                  type="text"
                  value={formData.preferredInstallTime || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, preferredInstallTime: event.target.value }))
                  }
                  placeholder={TEXT.preferredInstallTimePlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-700">{TEXT.preferredPickupTime}</span>
                <input
                  type="text"
                  value={formData.preferredPickupTime || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, preferredPickupTime: event.target.value }))
                  }
                  placeholder={TEXT.preferredPickupTimePlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  {TEXT.budget}
                  <RequiredDot />
                </span>
                <select
                  value={formData.budget || ""}
                  onChange={(event) => setFormData((prev) => ({ ...prev, budget: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                >
                  <option value="">예산을 선택해 주세요.</option>
                  {BUDGET_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">{TEXT.paymentMethod}</span>
              <select
                value={formData.paymentMethod || ""}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
              >
                <option value="">{TEXT.paymentMethodPlaceholder}</option>
                {PAYMENT_METHOD_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {formData.paymentMethod === ETC_PAYMENT_METHOD_LABEL && (
              <input
                type="text"
                value={etcPaymentMethod}
                onChange={(event) => setEtcPaymentMethod(event.target.value)}
                placeholder={TEXT.paymentMethodEtcPlaceholder}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
              />
            )}

            <label className="mt-2 block space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MessageSquareText size={16} className="text-[#001e45]" />
                {TEXT.notes}
              </span>
              <textarea
                rows={6}
                value={formData.notes}
                onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder={TEXT.notesPlaceholder}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium leading-relaxed text-slate-800 outline-none transition focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
              />
            </label>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </p>
            )}

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(event) => setPrivacyAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#001e45]"
              />
              <span className="text-sm leading-6 text-slate-600">
                <span className="mr-2 inline-flex items-center gap-2 font-bold text-slate-800">
                  {TEXT.privacyConsent}
                  <RequiredDot />
                </span>
                <Link to="/privacy" className="font-semibold text-[#001e45] underline underline-offset-4">
                  개인정보처리방침
                </Link>
                을 확인했으며 문의 접수를 위한 정보 수집 및 이용에 동의합니다.
              </span>
            </label>

            <div className="flex justify-center md:justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#001e45] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#132f66] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                {submitting ? TEXT.submitting : TEXT.submit}
              </button>
            </div>
          </form>
        </section>
      </Container>
    </main>
  );
};
