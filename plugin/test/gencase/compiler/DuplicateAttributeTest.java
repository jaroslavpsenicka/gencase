package gencase.compiler;

import com.intellij.openapi.module.Module;
import com.intellij.openapi.roots.ModuleRootManager;
import com.intellij.openapi.vfs.VFileProperty;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.impl.PsiManagerEx;
import com.intellij.testFramework.LightVirtualFile;
import com.intellij.testFramework.ParsingTestCase;
import gencase.GenCaseParserDefinition;
import junit.framework.TestCase;
import org.mockito.Mockito;

import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.eq;

public class DuplicateAttributeTest extends ParsingTestCase {

    private Module module;
    private PsiManagerEx psiManager;

    public DuplicateAttributeTest() {
        super("", "gcl", new GenCaseParserDefinition());
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        LightVirtualFile file = new LightVirtualFile("Attr", this.myLanguage, loadFile("Attribute.gcl"));
        PsiFile entity = this.createFile(file);

        VirtualFile src = Mockito.mock(VirtualFile.class);
        Mockito.when(src.isDirectory()).thenReturn(true);
        Mockito.when(src.isValid()).thenReturn(true);
        Mockito.when(src.is(eq(VFileProperty.SYMLINK))).thenReturn(false);
        Mockito.when(src.getChildren()).thenReturn(new VirtualFile[] { entity.getVirtualFile() });

        ModuleRootManager rootManager = Mockito.mock(ModuleRootManager.class);
        Mockito.when(rootManager.getSourceRoots(anyBoolean())).thenReturn(new VirtualFile[] { src });
        module = Mockito.mock(Module.class);
        Mockito.when(module.getComponent(eq(ModuleRootManager.class))).thenReturn(rootManager);
        psiManager = Mockito.mock(PsiManagerEx.class);
        Mockito.when(psiManager.findFile(eq(file))).thenReturn(entity);
    }

    public void testDuplicateAttribute() {
        try {
            new Compiler().findEntities(module, psiManager);
            TestCase.fail();
        } catch (CompileException ex) {
            TestCase.assertEquals(1, ex.getMessages().size());
            TestCase.assertEquals("Duplicate attribute: name", ex.getMessages().stream()
                .findFirst().orElseThrow(() -> new IllegalStateException("no message"))
                .getText());
        }
    }

    @Override
    protected String getTestDataPath() {
        return "test/resources/compiler";
    }

    @Override
    protected boolean includeRanges() {
        return true;
    }

}
