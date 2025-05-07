  setTimeout(() => {
    if (onSubmit) {
      console.log("Calling parent onSubmit function");
      onSubmit(formValues);
    } else {
      // This 'else' block might no longer be strictly necessary if DomainForm is always used with an onSubmit prop
      // from a parent page that handles toasts and global state.
      // For robustness, we can leave a console log or a minimal local alert if desired,
      // but primary feedback should come from the parent.
      console.warn("DomainForm was submitted without a parent onSubmit handler. Form values:", formValues);
      // setShowSuccessAlert(true); // Removed direct alert display
      // setTimeout(() => {
      //   setShowSuccessAlert(false);
      // }, 3000);
      
      // toast({ // Removed direct toast display
      //   title: "域设置已保存",
      //   description: "您可以继续下一步配置",
      //   variant: "default",
      // });
    }
    setIsSubmitting(false);
  }, 0); 